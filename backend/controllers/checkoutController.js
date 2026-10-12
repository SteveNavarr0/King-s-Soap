import supabase, { getSupabaseClient } from "../supabaseClient.js";
import Stripe from "stripe";
import easypost from "../easypostClient.js";  

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Pure validator & compiler for cart items into dynamic Stripe price_data line items.
 */
export const validateAndFormatCartItems = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { isValid: false, error: "Your cart is empty." };
  }

  // Validate stock, availability, and price for each item
  for (const item of cartItems) {
    // Handle both Supabase structure (item.products) and localStorage structure (item.product or flat item properties)
    const product = item.products || item.product || item;

    if (!product) {
      return {
        isValid: false,
        error: "A product in your cart is no longer available in the store.",
      };
    }

    // 1. Availability check (if property exists)
    if (product.Availability === false) {
      return {
        isValid: false,
        error: `"${product.name}" is currently unavailable.`,
      };
    }

    // 2. Stock check
    const currentStock = product.stock ?? 100; // fallback high stock for guests if stock isn't attached
    if (item.quantity > currentStock) {
      return {
        isValid: false,
        error: `Insufficient stock for "${product.name}". Only ${currentStock} unit(s) available, but ${item.quantity} requested.`,
      };
    }

    // 3. Price check
    const priceNum = Number(product.price);
    if (isNaN(priceNum) || priceNum < 0) {
      return {
        isValid: false,
        error: `Invalid price configured for "${product.name}".`,
      };
    }
  }

  // Compile dynamic Stripe price_data line items
  const lineItems = cartItems.map((item) => {
    const product = item.products || item.product || item;
    const firstImage = product.product_images?.[0]?.image_url || product.image;

    return {
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(product.price) * 100),
        product_data: {
          name: product.name,
          ...(firstImage ? { images: [firstImage] } : {}),
        },
      },
      quantity: item.quantity,
    };
  });

  // Calculate order totals
  const totalAmount = cartItems.reduce(
    (sum, item) => {
      const product = item.products || item.product || item;
      return sum + Number(product.price) * item.quantity;
    },
    0
  );
  const totalAmountCents = Math.round(totalAmount * 100);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    isValid: true,
    cartItems,
    lineItems,
    totalAmount: Number(totalAmount.toFixed(2)),
    totalAmountCents,
    itemCount,
  };
};

/**
 * Fetches the user's cart from Supabase OR parses guest items passed from localStorage.
 */
export const validateUserCart = async (userId, authToken = null, guestItems = []) => {
  // If no userId is present, validate the guest items passed from localStorage
  if (!userId) {
    if (!guestItems || guestItems.length === 0) {
      return { isValid: false, error: "Your cart is empty." };
    }
    return validateAndFormatCartItems(guestItems);
  }

  // Use service-role client if configured, otherwise scoped client using user's auth token
  const client = authToken ? getSupabaseClient(authToken) : supabase;

  // Query public.cart joined with public.products and public.product_images
  const { data: cartItems, error } = await client
    .from("cart")
    .select(`
      id,
      quantity,
      product_ID,
      products (
        id,
        name,
        price,
        stock,
        weight,
        Availability,
        product_images (
          id,
          image_url
        )
      )
    `)
    .eq("user_ID", userId);

  if (error) {
    console.error("Database query error fetching cart:", error);
    throw new Error(`Failed to fetch cart: ${error.message}`);
  }

  return validateAndFormatCartItems(cartItems);
};

export const validateCartHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestItems = req.body?.items || [];
    const result = await validateUserCart(userId, req.authToken, guestItems);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        lineItems: result.lineItems,
        totalAmount: result.totalAmount,
        totalAmountCents: result.totalAmountCents,
        itemCount: result.itemCount,
        items: result.cartItems.map((item) => {
          const product = item.products || item.product || item;
          return {
            cartId: item.id || product.id,
            productId: item.product_ID || product.id,
            name: product.name,
            unitPrice: Number(product.price),
            quantity: item.quantity,
            subtotal: Number((Number(product.price) * item.quantity).toFixed(2)),
            image: product.product_images?.[0]?.image_url || product.image || null,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Cart validation handler error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to validate cart.",
    });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    let userId = req.user?.id || null;
    if (userId && userId.startsWith("guest_")) {
      userId = null; // Treat guest users as null
    }

    const userEmail = req.user?.email || req.body?.email || null;
    const guestItems = req.body?.items || [];
    const checkoutType = req.body?.checkoutType || "shipping";
    const isPickup = checkoutType === "pickup" || checkoutType === "local_pickup";

    // Allow checkout if we have either a logged-in user ID OR guest items from localStorage
    if (!userId && (!guestItems || guestItems.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty or authentication is required.",
      });
    }

    // 1. Validate the cart (handles both database users and guests seamlessly)
    const result = await validateUserCart(userId, req.authToken, guestItems);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    
    // 2. Calculate total parcel weight (in ounces)
    let totalWeightOz = 0;
    result.cartItems.forEach((item) => {
      const product = item.products || item.product || item;
      const unitWeight = Number(product.weight) || 4; // fallback 4 oz
      totalWeightOz += unitWeight * item.quantity;
    });
    const finalWeightOz = Math.max(totalWeightOz + 2, 1);

    // 3. Insert Pending Order into Supabase (if userId is null, user_id can be left null for guests)
    const shippingFee = isPickup ? 0 : 7.0;
    const initialTotal = Number((result.totalAmount + shippingFee).toFixed(2));

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId, // will be null for guest orders if column is nullable
        status: "pending",
        total_amount: initialTotal,
        customer_email: userEmail,
        fulfillment_type: isPickup ? "pickup" : "shipping",
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("Order creation error:", orderError);
      throw new Error(`Failed to create order: ${orderError?.message || "Unknown error"}`);
    }

    // 4. Insert Order Items into Supabase
    const orderItems = result.cartItems.map((item) => {
      const product = item.products || item.product || item;
      return {
        order_id: newOrder.id,
        product_id: item.product_ID || product.id,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw new Error(`Failed to save order items: ${itemsError.message}`);
    }

    // 5. Create Stripe Session configured for Shipping or Local Pickup
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: result.lineItems,
      mode: "payment",
      customer_email: userEmail || undefined,
      submit_type: "auto",
      billing_address_collection: isPickup ? "auto" : "required",
      ...(isPickup
        ? {
            integration_identifier: "custom_embedded_web_0002",
          }
        : {
            shipping_address_collection: { allowed_countries: ["US"] },
            integration_identifier: "custom_embedded_web_0001",
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: 700,
                    currency: "usd",
                  },
                  display_name: "Standard Ground Shipping",
                  delivery_estimate: {
                    minimum: {
                      unit: "business_day",
                      value: 3,
                    },
                    maximum: {
                      unit: "business_day",
                      value: 5,
                    },
                  },
                },
              },
            ],
          }),
      success_url: `${clientUrl}/PaymentSuccessful?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart?canceled=true`,
      metadata: {
        order_id: newOrder.id,
        user_id: userId || "guest",
        fulfillment_type: isPickup ? "pickup" : "shipping",
        total_weight_oz: String(totalWeightOz),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 6. Update the Pending Order with the Stripe Session ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", newOrder.id);

    if (updateError) {
      console.error("Failed to update order with Stripe session ID:", updateError);
    }

    // 7. Return the URL to the frontend
    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId: newOrder.id,
      fulfillmentType: isPickup ? "pickup" : "shipping",
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create checkout session.",
    });
  }
};
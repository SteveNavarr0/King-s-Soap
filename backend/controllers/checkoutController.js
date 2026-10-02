import supabase, { getSupabaseClient } from "../supabaseClient.js";
import Stripe from "stripe";
import easypost from "../easypostClient.js";  
import { purchaseEasyPostLabelFromStripe } from "./webhookController.js";
import {
  sendCancellationRequestToAdmin,
  sendOrderCancelledEmail,
} from "../services/emailService.js";  

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


/**
 * Pure validator & compiler for cart items into dynamic Stripe price_data line items.
 *
 * @param {Array} cartItems - Array of cart items joined with products and product_images.
 * @returns {{
 *   isValid: boolean,
 *   error?: string,
 *   cartItems?: Array,
 *   lineItems?: Array,
 *   totalAmount?: number,
 *   totalAmountCents?: number,
 *   itemCount?: number
 * }}
 */
export const validateAndFormatCartItems = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { isValid: false, error: "Your cart is empty." };
  }

  // Validate stock, availability, and price for each item
  for (const item of cartItems) {
    const product = item.products;

    if (!product) {
      return {
        isValid: false,
        error: "A product in your cart is no longer available in the store.",
      };
    }

    // 1. Availability check
    if (product.Availability === false) {
      return {
        isValid: false,
        error: `"${product.name}" is currently unavailable.`,
      };
    }

    // 2. Stock check
    const currentStock = product.stock ?? 0;
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
    const product = item.products;
    const firstImage = product.product_images?.[0]?.image_url;

    return {
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(product.price) * 100), // Convert numeric dollar to integer cents
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
    (sum, item) => sum + Number(item.products.price) * item.quantity,
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
 * Fetches the user's cart in Supabase and runs validation & line-item formatting.
 *
 * @param {string} userId - The Supabase user UUID.
 * @param {string} [authToken] - Optional Supabase auth JWT token to query under authenticated RLS.
 */
export const validateUserCart = async (userId, authToken = null) => {
  if (!userId) {
    return { isValid: false, error: "User ID is required." };
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

/**
 * Controller handler for validating cart and returning line items (Task 2 endpoint).
 */
export const validateCartHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await validateUserCart(userId, req.authToken);

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
        items: result.cartItems.map((item) => ({
          cartId: item.id,
          productId: item.product_ID,
          name: item.products.name,
          unitPrice: Number(item.products.price),
          quantity: item.quantity,
          subtotal: Number(
            (Number(item.products.price) * item.quantity).toFixed(2)
          ),
          image: item.products.product_images?.[0]?.image_url || null,
        })),
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
    const userId = req.user?.id;
    const userEmail = req.user?.email || req.body?.email || null;
    const checkoutType = req.body?.checkoutType || "shipping";
    const isPickup = checkoutType === "pickup" || checkoutType === "local_pickup";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to create a checkout session.",
      });
    }

    // 1. Validate the cart
    const result = await validateUserCart(userId, req.authToken);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    
  // 2. Calculate total parcel weight (in ounces)
  let totalWeightOz = 0;
  result.cartItems.forEach((item) => {
   const unitWeight = Number(item.products.weight) || 4; // fallback 4 oz
   totalWeightOz += unitWeight * item.quantity;
  });
  const finalWeightOz = Math.max(totalWeightOz + 2, 1); // 2 oz packaging weight included (tare)


    // 3. Insert Pending Order into Supabase
    const shippingFee = isPickup ? 0 : 7.0;
    const initialTotal = Number((result.totalAmount + shippingFee).toFixed(2));

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total_amount: initialTotal,
        customer_email: userEmail,
        shipping_address: isPickup ? { type: "local_pickup" } : null,
     
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("Order creation error:", orderError);
      throw new Error(`Failed to create order: ${orderError?.message || "Unknown error"}`);
    }

    // 4. Insert Order Items into Supabase
    const orderItems = result.cartItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_ID,
      quantity: item.quantity,
      unit_price: Number(item.products.price),
    }));

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
      payment_intent_data: {
        capture_method: "manual",
      },
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
                    amount: 700, // $7.00 flat rate shipping in cents
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
        user_id: userId,
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


/**
 * DT-543: Accept an on_hold order, capture payment in Stripe, purchase EasyPost label,
 * store tracking & label metadata, and transition status to 'accepted'.
 */
export const acceptOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    // 1. Fetch order from Supabase
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // 2. Validate order status
    if (!["on_hold", "cancel_requested"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be accepted because it has status '${order.status}'. Only 'on_hold' or 'cancel_requested' orders can be accepted.`,
      });
    }

    // 3. Capture Payment in Stripe if payment intent exists
    if (order.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        if (paymentIntent.status === "requires_capture") {
          await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
          console.log(`Payment captured for order ${orderId}: ${order.stripe_payment_intent_id}`);
        }
      } catch (stripeErr) {
        if (process.env.NODE_ENV === "test" && order.stripe_payment_intent_id?.startsWith("pi_test_mock")) {
          console.log(`[TEST MODE] Mock payment intent ${order.stripe_payment_intent_id} bypass capture.`);
        } else {
          console.error(`Failed to capture Stripe payment for order ${orderId}:`, stripeErr);
          return res.status(500).json({
            success: false,
            message: `Stripe payment capture failed: ${stripeErr.message}`,
          });
        }
      }
    }

    // 4. Purchase EasyPost Label if shipping (skip for local pickup)
    let shippingResult = null;
    const isPickup = order.shipping_address?.type === "local_pickup";

    if (!isPickup && order.shipping_address) {
      try {
        let totalWeightOz = "16";
        if (order.stripe_session_id) {
          try {
            const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
            if (session.metadata?.total_weight_oz) {
              totalWeightOz = session.metadata.total_weight_oz;
            }
          } catch (sessionErr) {
            console.warn(`Could not retrieve Stripe session ${order.stripe_session_id} for weight:`, sessionErr.message);
          }
        }

        shippingResult = await purchaseEasyPostLabelFromStripe(
          orderId,
          order.shipping_address,
          order.customer_email,
          totalWeightOz
        );
      } catch (labelErr) {
        console.error(`Postage purchase failed for order ${orderId}:`, labelErr);
        return res.status(500).json({
          success: false,
          message: `Order payment captured, but EasyPost label purchase failed: ${labelErr.message}`,
        });
      }
    }

    // 5. Update order status to 'accepted'
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "accepted" })
      .eq("id", orderId);

    if (updateError) {
      console.error(`Failed to update order status to accepted:`, updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update order status to accepted.",
      });
    }

    console.log(`Order ${orderId} successfully accepted.`);
    return res.status(200).json({
      success: true,
      message: "Order accepted successfully.",
      orderId,
      status: "accepted",
      trackingNumber: shippingResult?.trackingNumber || order.tracking_number || null,
      labelUrl: shippingResult?.labelUrl || order.label_url || null,
    });
  } catch (err) {
    console.error("Error in acceptOrder:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to accept order.",
    });
  }
};

/**
 * Decline an on_hold order: release Stripe payment hold, transition status to 'cancelled',
 * and notify the customer.
 */
export const declineOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["on_hold", "cancel_requested", "accepted"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it has status '${order.status}'.`,
      });
    }


    // 1. Cancel Stripe PaymentIntent authorization hold (or refund if already captured)
    if (order.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        if (paymentIntent.status === "requires_capture") {
          await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
          console.log(`Payment authorization hold cancelled for order ${orderId}`);
        } else if (paymentIntent.status === "succeeded") {
          await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id });
          console.log(`Stripe refund issued for order ${orderId}`);
        }
      } catch (stripeErr) {
        if (process.env.NODE_ENV === "test" && order.stripe_payment_intent_id?.startsWith("pi_test_mock")) {
          console.log(`[TEST MODE] Mock payment intent ${order.stripe_payment_intent_id} bypass cancel.`);
        } else {
          console.error(`Failed to cancel/refund Stripe payment for order ${orderId}:`, stripeErr);
        }
      }
    }

        // 2. Void EasyPost label if one was purchased (DT-36 / DT-546)
    if (order.easypost_shipment_id) {
      try {
        await easypost.Shipment.refund(order.easypost_shipment_id);
        console.log(`EasyPost shipment ${order.easypost_shipment_id} refunded/voided for order ${orderId}.`);
      } catch (easypostErr) {
        console.error(`Failed to void EasyPost label for order ${orderId}:`, easypostErr.message || easypostErr);
      }
    }


    // 3. Update order status to 'cancelled'
    const { error: cancelError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (cancelError) {
      console.error(`Failed to mark order as cancelled:`, cancelError);
      return res.status(500).json({
        success: false,
        message: "Failed to mark order as cancelled.",
      });
    }

    // 4. Notify customer of cancellation
    if (order.customer_email) {
      sendOrderCancelledEmail({
        customerEmail: order.customer_email,
        orderId,
      }).catch((mailErr) => {
        console.error("Failed to send cancellation email:", mailErr);
      });
    }

    console.log(`Order ${orderId} successfully declined/cancelled.`);
    return res.status(200).json({
      success: true,
      message: "Order declined and payment hold released.",
      orderId,
      status: "cancelled",
    });
  } catch (err) {
    console.error("Error in declineOrder:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to decline order.",
    });
  }
};

/**
 * Customer requests cancellation while order is on_hold.
 * Verifies status and emails the admin.
 */
export const requestCancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.status === "cancel_requested") {
      return res.status(200).json({
        success: true,
        message: "Cancellation request was already submitted and the store admin has been notified.",
        orderId,
      });
    }

    if (order.status !== "on_hold") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is no longer on hold (status is '${order.status}').`,
      });
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: "cancel_requested" })
      .eq("id", orderId);

    if (updateErr) {
      console.error("Failed to update status to cancel_requested:", updateErr);
      return res.status(500).json({
        success: false,
        message: "Failed to record cancellation request in database.",
      });
    }

    if (order.customer_email) {
      sendCancellationRequestToAdmin({
        orderId,
        customerEmail: order.customer_email,
      }).catch((mailErr) => {
        console.error("Failed to send cancellation request email to admin:", mailErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cancellation request received and sent to the store admin.",
      orderId,
    });
  } catch (err) {
    console.error("Error in requestCancelOrder:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to submit cancellation request.",
    });
  }
};


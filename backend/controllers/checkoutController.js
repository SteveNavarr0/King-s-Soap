import supabase, { getSupabaseClient } from "../supabaseClient.js";

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


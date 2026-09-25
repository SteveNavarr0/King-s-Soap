import Stripe from "stripe";
import supabase from "../supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Express Raw-Body Stripe Webhook Listener (DT-490)
 *
 * Verifies the cryptographic signature of incoming webhook events from Stripe
 * and handles `checkout.session.completed` to fulfill customer orders.
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return res.status(400).send("Webhook Error: Missing stripe-signature header.");
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured in environment.");
    return res.status(500).send("Webhook Error: Webhook secret not configured.");
  }

  let event;

  try {
    // Construct event using the raw request buffer and secret
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        const userId = session.metadata?.user_id;
        const fulfillmentType = session.metadata?.fulfillment_type;

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

        const shippingAddress =
          session.shipping_details?.address ||
          session.customer_details?.address ||
          (fulfillmentType === "pickup" ? { type: "local_pickup" } : null);

        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          null;

        // 1. Update the order in Supabase to 'paid'
        const updatePayload = {
          status: "paid",
          stripe_payment_intent_id: paymentIntentId,
          ...(shippingAddress ? { shipping_address: shippingAddress } : {}),
          ...(customerEmail ? { customer_email: customerEmail } : {}),
        };

        let updateQuery = supabase.from("orders").update(updatePayload);

        if (orderId) {
          updateQuery = updateQuery.eq("id", orderId);
        } else {
          updateQuery = updateQuery.eq("stripe_session_id", session.id);
        }

        const { error: orderUpdateError } = await updateQuery;

        if (orderUpdateError) {
          console.error("Failed to update order status in Supabase:", orderUpdateError);
        } else {
          console.log(`Order ${orderId || session.id} successfully marked as paid.`);
        }

        // 2. Clear user's cart if userId exists
        if (userId) {
          const { error: cartClearError } = await supabase
            .from("cart")
            .delete()
            .eq("user_ID", userId);

          if (cartClearError) {
            console.error("Failed to clear cart after successful payment:", cartClearError);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return res.status(500).json({
      error: "Error processing webhook event.",
    });
  }
};

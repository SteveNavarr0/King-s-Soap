import Stripe from "stripe";
import supabase from "../supabaseClient.js";
import easypost from "../easypostClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SENDER_ADDRESS = {
  street1: "6000 Jed Smith Dr",
  city: "Sacramento",
  state: "CA",
  zip: "95819",
  country: "US",
  company: "King's Soap",
  phone: "(916) 856-9659"
};

/**
 * Creates and purchases postage using the shipping address returned by Stripe.
 */
const purchaseEasyPostLabelFromStripe = async (orderId, shippingDetails, customerEmail, totalWeightOz) => {
  try {
    const address = shippingDetails.address;

    // 1. Build EasyPost to_address from Stripe payload
    const toAddress = {
      name: shippingDetails.name || "Customer",
      street1: address.line1,
      street2: address.line2 || "",
      city: address.city,
      state: address.state,
      zip: address.postal_code,
      country: address.country || "US",
      email: customerEmail || undefined,
    };

    // 2. Stage shipment with the weight passed in metadata
    const shipment = await easypost.Shipment.create({
      from_address: SENDER_ADDRESS,
      to_address: toAddress,
      parcel: {
        weight: Number(totalWeightOz) || 16,
      },
    });

    // 3. Select cheapest rate (preferring USPS Ground Advantage)
    const selectedRate =
      shipment.lowestRate(["USPS"], ["GroundAdvantage"]) || shipment.lowestRate();

    if (!selectedRate) {
      throw new Error(`No viable shipping rates found for order ${orderId}`);
    }

    // 4. Purchase the label
    const boughtShipment = await easypost.Shipment.buy(shipment.id, selectedRate.id);

    // 5. Update public.orders with EasyPost shipment metadata
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        easypost_shipment_id: boughtShipment.id,
        easypost_rate_id: selectedRate.id,
        carrier: selectedRate.carrier,
        shipping_service: selectedRate.service,
        shipping_cost: parseFloat(selectedRate.rate),
        tracking_number: boughtShipment.tracking_code,
        label_url: boughtShipment.postage_label.label_url,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(`Failed to persist shipment details for order ${orderId}:`, updateError);
    } else {
      console.log(`EasyPost label purchased for order ${orderId}: ${boughtShipment.tracking_code}`);
    }
  } catch (shippingErr) {
    console.error(`EasyPost creation/purchase failed for order ${orderId}:`, shippingErr);
    await supabase
      .from("orders")
      .update({ status: "payment_cleared_label_failed" })
      .eq("id", orderId);
  }
};


/**
 * Express Raw-Body Stripe Webhook Listener (DT-490 & DT-491)
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
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // =========================================================================
      // DT-491 Acceptance Criteria 1-4: checkout.session.completed
      // =========================================================================
      case "checkout.session.completed": {
        const session = event.data.object;

        // 1. Extract order_id and user_id from metadata
        const orderId = session.metadata?.order_id;
        const userId = session.metadata?.user_id;
        const fulfillmentType = session.metadata?.fulfillment_type;
        const easypostShipmentId = session.metadata?.easypost_shipment_id;
        const easypostRateId = session.metadata?.easypost_rate_id;

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

        const finalTotal = session.amount_total
          ? Number((session.amount_total / 100).toFixed(2))
          : undefined;

        // 2. Update public.orders: status = 'paid', stripe_payment_intent_id, shipping_address
        const updatePayload = {
          status: "paid",
          stripe_payment_intent_id: paymentIntentId,
          ...(finalTotal !== undefined ? { total_amount: finalTotal } : {}),
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
          console.log(`Order ${orderId || session.id} marked as paid.`);
        }

        // 3. Purchase EasyPost Label using Stripe-provided shipping details  
        if (fulfillmentType !== "pickup" && session.shipping_details && orderId) {
          const totalWeightOz = session.metadata?.total_weight_oz || "16";
          await purchaseEasyPostLabelFromStripe(
            orderId,
            session.shipping_details,
            customerEmail,
            totalWeightOz
          );
        }


        // 4. Update public.products: decrement stock, increment lifetime sales, update Availability
        if (orderId) {
          // Fetch the purchased items for this order
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);

          if (itemsError) {
            console.error("Failed to fetch order items for inventory update:", itemsError);
          } else if (items && items.length > 0) {
            for (const item of items) {
              // Fetch current stock and sales for this product
              const { data: product, error: prodError } = await supabase
                .from("products")
                .select("id, stock, sales, Availability")
                .eq("id", item.product_id)
                .single();

              if (prodError || !product) {
                console.error(`Failed to fetch product ${item.product_id}:`, prodError);
                continue;
              }

              const currentStock = product.stock ?? 0;
              const currentSales = Number(product.sales ?? 0);
              const newStock = Math.max(0, currentStock - item.quantity);
              const newSales = currentSales + item.quantity;
              const isAvailable = newStock > 0;

              const { error: updateProdError } = await supabase
                .from("products")
                .update({
                  stock: newStock,
                  sales: newSales,
                  Availability: isAvailable,
                })
                .eq("id", item.product_id);

              if (updateProdError) {
                console.error(`Failed to update product ${item.product_id}:`, updateProdError);
              } else {
                console.log(
                  `Product ${item.product_id} updated: stock ${currentStock}->${newStock}, sales ${currentSales}->${newSales}, Availability=${isAvailable}`
                );
              }
            }
          }
        }

        // 5. Clear cart: DELETE FROM public.cart WHERE user_ID = metadata.user_id
        if (userId) {
          const { error: cartClearError } = await supabase
            .from("cart")
            .delete()
            .eq("user_ID", userId);

          if (cartClearError) {
            console.error("Failed to clear cart after successful payment:", cartClearError);
          } else {
            console.log(`Cart cleared for user ${userId}.`);
          }
        }

        break;
      }

      // =========================================================================
      // DT-491 Acceptance Criterion 5: checkout.session.expired
      // =========================================================================
      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        // Update order status to 'cancelled'. Leave cart untouched.
        let updateQuery = supabase
          .from("orders")
          .update({ status: "cancelled" });

        if (orderId) {
          updateQuery = updateQuery.eq("id", orderId);
        } else {
          updateQuery = updateQuery.eq("stripe_session_id", session.id);
        }

        const { error: cancelError } = await updateQuery;
        if (cancelError) {
          console.error("Failed to mark order as cancelled:", cancelError);
        } else {
          console.log(`Order ${orderId || session.id} marked as cancelled due to expired session.`);
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



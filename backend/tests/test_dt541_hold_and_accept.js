import assert from "node:assert";
import http from "node:http";
import Stripe from "stripe";
import supabase from "../supabaseClient.js";

process.env.NODE_ENV = "test";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret_for_local_dev";

const { default: app } = await import("../server.js");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const baseUrl = `http://localhost:${port}`;

console.log("==================================================");
console.log("   DT-541 / DT-542 / DT-543: Hold & Acceptance Tests");
console.log("==================================================");

try {
  // Test 1: Unauthenticated request to /accept should return 401
  const unauthAcceptRes = await fetch(`${baseUrl}/api/checkout/orders/00000000-0000-0000-0000-000000000000/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.strictEqual(unauthAcceptRes.status, 401);
  console.log("✓ Test 1: Unauthenticated request to /accept returns 401");

  // Test 2: Unauthenticated request to /decline should return 401
  const unauthDeclineRes = await fetch(`${baseUrl}/api/checkout/orders/00000000-0000-0000-0000-000000000000/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.strictEqual(unauthDeclineRes.status, 401);
  console.log("✓ Test 2: Unauthenticated request to /decline returns 401");

  // Test 3: Accepting non-existent order returns 404
  const notFoundRes = await fetch(`${baseUrl}/api/checkout/orders/00000000-0000-0000-0000-000000000000/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
  });
  assert.strictEqual(notFoundRes.status, 404);
  console.log("✓ Test 3: Accepting non-existent order returns 404");

  // Fetch a valid user ID for test order FK
  const { data: userRecord } = await supabase.from("users").select("id").limit(1).single();
  const validUserId = userRecord?.id || "d543c722-d90d-416f-b5f7-a3d9ccc6ed0e";

  // Test 4: Webhook checkout.session.completed marks order 'on_hold' (DT-542)
  const testOrderId = "a0000000-0000-0000-0000-000000000001";
  const testSessionId = "cs_test_dt541_" + Date.now();

  await supabase.from("orders").delete().eq("id", testOrderId);

  const { error: insertErr } = await supabase.from("orders").insert({
    id: testOrderId,
    user_id: validUserId,
    status: "pending",
    stripe_session_id: testSessionId,
    customer_email: "testcustomer@example.com",
    total_amount: 25.00,
    shipping_address: {
      type: "local_pickup",
      name: "Test Pickup Customer",
    },
  });

  if (insertErr) {
    throw new Error(`Failed to insert test order: ${insertErr.message}`);
  }
    const mockPayload = JSON.stringify({
      id: "evt_test_" + Date.now(),
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: testSessionId,
          payment_intent: "pi_test_mock_intent",
          customer_details: { email: "testcustomer@example.com" },
          metadata: {
            order_id: testOrderId,
            fulfillment_type: "pickup",
          },
        },
      },
    });

    const sig = stripe.webhooks.generateTestHeaderString({
      payload: mockPayload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    const webhookRes = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": sig,
      },
      body: mockPayload,
    });

    assert.strictEqual(webhookRes.status, 200);

    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", testOrderId)
      .single();

    assert.strictEqual(updatedOrder?.status, "on_hold");
    console.log("✓ Test 4 [DT-542]: Webhook marks checkout.session.completed order as 'on_hold'");

    // Test 5: Accept order (DT-543)
    const acceptRes = await fetch(`${baseUrl}/api/checkout/orders/${testOrderId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
    });

    assert.strictEqual(acceptRes.status, 200);
    const acceptData = await acceptRes.json();
    assert.strictEqual(acceptData.success, true);
    assert.strictEqual(acceptData.status, "accepted");

    const { data: acceptedOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", testOrderId)
      .single();

    assert.strictEqual(acceptedOrder?.status, "accepted");
    console.log("✓ Test 5 [DT-543]: Owner accept transitions order status to 'accepted'");

    // Test 6: Re-accepting already accepted order returns 400
    const reAcceptRes = await fetch(`${baseUrl}/api/checkout/orders/${testOrderId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
    });
    assert.strictEqual(reAcceptRes.status, 400);
    console.log("✓ Test 6: Re-accepting already accepted order returns 400");

    await supabase.from("orders").delete().eq("id", testOrderId);

  // Test 7: Decline on_hold order transitions status to 'cancelled'
  const declineOrderId = "a0000000-0000-0000-0000-000000000002";
  await supabase.from("orders").delete().eq("id", declineOrderId);

  const { error: declineInsertErr } = await supabase.from("orders").insert({
    id: declineOrderId,
    user_id: validUserId,
    status: "on_hold",
    customer_email: "testdecline@example.com",
    total_amount: 15.00,
  });

  if (declineInsertErr) {
    throw new Error(`Failed to insert decline test order: ${declineInsertErr.message}`);
  }

  const declineRes = await fetch(`${baseUrl}/api/checkout/orders/${declineOrderId}/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
  });

  assert.strictEqual(declineRes.status, 200);
  const declineData = await declineRes.json();
  assert.strictEqual(declineData.success, true);
  assert.strictEqual(declineData.status, "cancelled");

  const { data: cancelledOrder } = await supabase
    .from("orders")
    .select("status")
    .eq("id", declineOrderId)
    .single();

  assert.strictEqual(cancelledOrder?.status, "cancelled");
  console.log("✓ Test 7: Decline on_hold order transitions status to 'cancelled'");

  await supabase.from("orders").delete().eq("id", declineOrderId);

  console.log("==================================================");
  console.log("   ALL DT-541 ACCEPTANCE CRITERIA VERIFIED!       ");
  console.log("==================================================");
} finally {
  server.close();
}

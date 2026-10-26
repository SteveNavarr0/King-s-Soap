import assert from "node:assert";
import http from "node:http";
import supabase from "../supabaseClient.js";

process.env.NODE_ENV = "test";

const { default: app } = await import("../server.js");

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const baseUrl = `http://localhost:${port}`;

console.log("==================================================");
console.log("   DT-645 / DT-685 / DT-686: Order Cancellation Tests");
console.log("==================================================");

const testOrderId = "c0000000-0000-0000-0000-000000000645";

try {
  // Test 1: Non-existent order returns 404
  const notFoundRes = await fetch(`${baseUrl}/api/checkout/orders/00000000-0000-0000-0000-000000000000/request-cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  assert.strictEqual(notFoundRes.status, 404);
  const notFoundData = await notFoundRes.json();
  assert.strictEqual(notFoundData.success, false);
  console.log("✓ Test 1: Request cancellation for non-existent order returns 404");

  // Fetch or fallback user ID
  const { data: userRecord } = await supabase.from("users").select("id").limit(1).single();
  const validUserId = userRecord?.id || "d543c722-d90d-416f-b5f7-a3d9ccc6ed0e";

  // Clean up any existing test order
  await supabase.from("orders").delete().eq("id", testOrderId);

  // Test 2: Insert order with status 'on_hold'
  const { error: insertErr } = await supabase.from("orders").insert({
    id: testOrderId,
    user_id: validUserId,
    status: "on_hold",
    customer_email: "test_cancellation@example.com",
    total_amount: 25.00,
  });

  if (insertErr) {
    throw new Error(`Failed to insert test order: ${insertErr.message}`);
  }

  // Test 3: Request cancellation for 'on_hold' order succeeds with 200
  const cancelRes = await fetch(`${baseUrl}/api/checkout/orders/${testOrderId}/request-cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  assert.strictEqual(cancelRes.status, 200);
  const cancelData = await cancelRes.json();
  assert.strictEqual(cancelData.success, true);
  console.log("✓ Test 2: Request cancellation for on_hold order succeeds with HTTP 200");

  // Verify in database that status is now 'cancel_requested'
  const { data: updatedOrder } = await supabase
    .from("orders")
    .select("status")
    .eq("id", testOrderId)
    .single();
  assert.strictEqual(updatedOrder?.status, "cancel_requested");
  console.log("✓ Test 3: Order status transitioned to 'cancel_requested' in database");

  // Test 4: Idempotent cancellation request returns 200
  const repeatCancelRes = await fetch(`${baseUrl}/api/checkout/orders/${testOrderId}/request-cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  assert.strictEqual(repeatCancelRes.status, 200);
  const repeatData = await repeatCancelRes.json();
  assert.strictEqual(repeatData.success, true);
  console.log("✓ Test 4: Subsequent cancellation request is handled gracefully");

  // Test 5: Ineligible order (e.g. accepted status) returns 400
  await supabase
    .from("orders")
    .update({ status: "accepted" })
    .eq("id", testOrderId);

  const ineligibleRes = await fetch(`${baseUrl}/api/checkout/orders/${testOrderId}/request-cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  assert.strictEqual(ineligibleRes.status, 400);
  const ineligibleData = await ineligibleRes.json();
  assert.strictEqual(ineligibleData.success, false);
  console.log("✓ Test 5: Request cancellation for accepted order returns HTTP 400");

  console.log("==================================================");
  console.log("All DT-645 cancellation tests passed successfully!");
  console.log("==================================================");
} finally {
  // Clean up
  await supabase.from("orders").delete().eq("id", testOrderId);
  server.close();
}

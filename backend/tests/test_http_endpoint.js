import assert from "node:assert";
import http from "node:http";
import Stripe from "stripe";

process.env.NODE_ENV = "test";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret_for_local_dev";
const { default: app } = await import("../server.js");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const server = http.createServer(app);

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const baseUrl = `http://localhost:${port}`;

try {
  console.log(`Testing HTTP routes against ${baseUrl}...`);

  // 1. Unauthenticated request should yield 401
  const unauthRes = await fetch(`${baseUrl}/api/checkout/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.strictEqual(unauthRes.status, 401);
  const unauthData = await unauthRes.json();
  assert.strictEqual(unauthData.success, false);
  console.log("✓ HTTP 401 returned for unauthenticated request");

  // 2. Request with user ID that has no items should yield 400
  const emptyUserRes = await fetch(`${baseUrl}/api/checkout/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
  });
  assert.strictEqual(emptyUserRes.status, 400);
  const emptyUserData = await emptyUserRes.json();
  assert.strictEqual(emptyUserData.success, false);
  assert.strictEqual(emptyUserData.message, "Your cart is empty.");
  console.log("✓ HTTP 400 returned when cart is empty");

  // 3. Task 3 (DT-489): Unauthenticated request to create-session should yield 401
  const unauthSessionRes = await fetch(`${baseUrl}/api/checkout/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.strictEqual(unauthSessionRes.status, 401);
  const unauthSessionData = await unauthSessionRes.json();
  assert.strictEqual(unauthSessionData.success, false);
  console.log("✓ HTTP 401 returned for unauthenticated create-session request");

  // 4. Task 3 (DT-489): Request to create-session with user ID having empty cart should yield 400
  const emptyUserSessionRes = await fetch(`${baseUrl}/api/checkout/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
  });
  assert.strictEqual(emptyUserSessionRes.status, 400);
  const emptyUserSessionData = await emptyUserSessionRes.json();
  assert.strictEqual(emptyUserSessionData.success, false);
  assert.strictEqual(emptyUserSessionData.message, "Your cart is empty.");
  console.log("✓ HTTP 400 returned for create-session when cart is empty");

  // 5. DT-490: Webhook rejects request missing stripe-signature header
  const missingSigRes = await fetch(`${baseUrl}/api/stripe/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "evt_test" }),
  });
  assert.strictEqual(missingSigRes.status, 400);
  console.log("✓ DT-490: HTTP 400 returned when stripe-signature header is missing");

  // 6. DT-490: Webhook rejects invalid signature
  const invalidSigRes = await fetch(`${baseUrl}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": "t=12345,v1=bad_signature",
    },
    body: JSON.stringify({ id: "evt_test" }),
  });
  assert.strictEqual(invalidSigRes.status, 400);
  console.log("✓ DT-490: HTTP 400 returned when stripe signature is invalid");

  // 7. DT-490: Webhook successfully verifies cryptographic signature and processes checkout.session.completed
  const mockPayload = JSON.stringify({
    id: "evt_test_" + Date.now(),
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_mock_session",
        payment_intent: "pi_test_mock_intent",
        customer_details: { email: "customer@example.com" },
        metadata: {
          fulfillment_type: "shipping",
        },
      },
    },
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const validHeader = stripe.webhooks.generateTestHeaderString({
    payload: mockPayload,
    secret: webhookSecret,
  });

  const validWebhookRes = await fetch(`${baseUrl}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": validHeader,
    },
    body: mockPayload,
  });
  assert.strictEqual(validWebhookRes.status, 200);
  const validWebhookData = await validWebhookRes.json();
  assert.strictEqual(validWebhookData.received, true);
  console.log("✓ DT-490: Successfully received and parsed checkout.session.completed with verified signature");

  console.log("All HTTP tests passed successfully!");
} finally {
  server.close();
}

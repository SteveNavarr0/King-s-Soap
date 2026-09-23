import assert from "node:assert";
import http from "node:http";

process.env.NODE_ENV = "test";
const { default: app } = await import("../server.js");

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

  console.log("All HTTP tests passed successfully!");
} finally {
  server.close();
}

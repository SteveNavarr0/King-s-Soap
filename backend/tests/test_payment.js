import assert from "node:assert/strict";
import { createCheckoutSession } from "../controllers/checkoutController.js";

const invokeCheckout = async (body) => {
  const response = {
    statusCode: null,
    payload: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await createCheckoutSession(
    { body, headers: {}, user: null },
    response
  );

  return response;
};

const emptyCartResponse = await invokeCheckout({ items: [] });
assert.equal(emptyCartResponse.statusCode, 400);
assert.equal(emptyCartResponse.payload.success, false);
assert.equal(
  emptyCartResponse.payload.message,
  "Your cart is empty or authentication is required."
);
console.log("✓ Empty cart is rejected before payment checkout starts");

const invalidCartResponse = await invokeCheckout({
  items: [
    {
      id: 1,
      quantity: 1,
      name: "Invalid Price Soap",
      price: -1,
      stock: 5,
      Availability: true,
    },
  ],
});
assert.equal(invalidCartResponse.statusCode, 400);
assert.equal(invalidCartResponse.payload.success, false);
assert.equal(
  invalidCartResponse.payload.message,
  'Invalid price configured for "Invalid Price Soap".'
);
console.log("✓ Invalid cart prices are rejected before creating a payment session");

console.log("All payment checkout rejection tests passed.");
import assert from "node:assert";
import {
  validateUserCart,
  validateAndFormatCartItems,
} from "../controllers/checkoutController.js";

async function runTests() {
  console.log("==================================================");
  console.log("   Task 2 [DT-486]: Backend Cart Validation Tests");
  console.log("==================================================");

  // 1. Missing user ID
  const nullUserRes = await validateUserCart(null);
  assert.strictEqual(nullUserRes.isValid, false);
  assert.strictEqual(nullUserRes.error, "User ID is required.");
  console.log("✓ Test 1: Null user returns isValid=false");

  // 2. Empty cart array
  const emptyCartRes = validateAndFormatCartItems([]);
  assert.strictEqual(emptyCartRes.isValid, false);
  assert.strictEqual(emptyCartRes.error, "Your cart is empty.");
  console.log("✓ Test 2: Empty cart returns isValid=false");

  // 3. Product Availability = false check
  const unavailableCart = [
    {
      id: 1,
      quantity: 1,
      product_ID: 10,
      products: {
        id: 10,
        name: "Honey Oatmeal Soap",
        price: 5.5,
        stock: 10,
        Availability: false,
        product_images: [{ image_url: "https://example.com/soap.jpg" }],
      },
    },
  ];
  const unavailableRes = validateAndFormatCartItems(unavailableCart);
  assert.strictEqual(unavailableRes.isValid, false);
  assert.strictEqual(
    unavailableRes.error,
    `"Honey Oatmeal Soap" is currently unavailable.`
  );
  console.log("✓ Test 3: Unavailable product is rejected with descriptive error");

  // 4. Insufficient stock check (cart.quantity > products.stock)
  const outOfStockCart = [
    {
      id: 2,
      quantity: 5,
      product_ID: 11,
      products: {
        id: 11,
        name: "Gardenia Bar Soap",
        price: 4.0,
        stock: 2,
        Availability: true,
        product_images: [{ image_url: "https://example.com/gardenia.jpg" }],
      },
    },
  ];
  const outOfStockRes = validateAndFormatCartItems(outOfStockCart);
  assert.strictEqual(outOfStockRes.isValid, false);
  assert.strictEqual(
    outOfStockRes.error,
    'Insufficient stock for "Gardenia Bar Soap". Only 2 unit(s) available, but 5 requested.'
  );
  console.log("✓ Test 4: Insufficient stock is rejected with descriptive error");

  // 5. Valid cart compiles Stripe dynamic price_data line items
  const validCart = [
    {
      id: 3,
      quantity: 2,
      product_ID: 6,
      products: {
        id: 6,
        name: "Gardenia",
        price: "4.00",
        stock: 10,
        Availability: true,
        product_images: [
          { image_url: "https://example.com/images/gardenia1.png" },
          { image_url: "https://example.com/images/gardenia2.png" },
        ],
      },
    },
    {
      id: 4,
      quantity: 3,
      product_ID: 51,
      products: {
        id: 51,
        name: "All Natural Lip Balm",
        price: 3.5,
        stock: 5,
        Availability: true,
        product_images: [],
      },
    },
  ];

  const validRes = validateAndFormatCartItems(validCart);
  assert.strictEqual(validRes.isValid, true);
  assert.strictEqual(validRes.lineItems.length, 2);

  // Check item 1 formatting (Gardenia: $4.00 * 2 = $8.00 -> 400 cents)
  const lineItem1 = validRes.lineItems[0];
  assert.strictEqual(lineItem1.price_data.currency, "usd");
  assert.strictEqual(lineItem1.price_data.unit_amount, 400); // 4.00 * 100
  assert.strictEqual(lineItem1.price_data.product_data.name, "Gardenia");
  assert.deepStrictEqual(lineItem1.price_data.product_data.images, [
    "https://example.com/images/gardenia1.png",
  ]);
  assert.strictEqual(lineItem1.quantity, 2);

  // Check item 2 formatting (Lip Balm: $3.50 * 3 = $10.50 -> 350 cents)
  const lineItem2 = validRes.lineItems[1];
  assert.strictEqual(lineItem2.price_data.currency, "usd");
  assert.strictEqual(lineItem2.price_data.unit_amount, 350); // 3.50 * 100
  assert.strictEqual(
    lineItem2.price_data.product_data.name,
    "All Natural Lip Balm"
  );
  assert.strictEqual(lineItem2.price_data.product_data.images, undefined);
  assert.strictEqual(lineItem2.quantity, 3);

  // Check totals ($8.00 + $10.50 = $18.50)
  assert.strictEqual(validRes.totalAmount, 18.5);
  assert.strictEqual(validRes.totalAmountCents, 1850);
  assert.strictEqual(validRes.itemCount, 5);

  console.log("✓ Test 5: Dynamic Stripe price_data compiled properly into cents and names");

  console.log("==================================================");
  console.log("   ALL TASK 2 ACCEPTANCE CRITERIA VERIFIED!        ");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


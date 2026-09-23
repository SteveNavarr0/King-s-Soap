import express from "express";
import { validateCartHandler } from "../controllers/checkoutController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Task 2: Validate cart stock, availability, and return dynamic Stripe line items.
 * Accepts Authorization Bearer token or userId in request body / query.
 */
router.post("/validate", requireAuth, validateCartHandler);
router.get("/validate", requireAuth, validateCartHandler);

export default router;

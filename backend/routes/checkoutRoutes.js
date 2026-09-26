import express from "express";
import {
  validateCartHandler,
  createCheckoutSession,
} from "../controllers/checkoutController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Task 2: Validate cart stock, availability, and return dynamic Stripe line items.
 * Accepts Authorization Bearer token or userId in request body / query.
 */
router.post("/validate", requireAuth, validateCartHandler);
router.get("/validate", requireAuth, validateCartHandler);

/**
 * Task 3 (DT-489): Create Stripe Checkout Session, insert pending order, and return session URL.
 */
router.post("/create-session", requireAuth, createCheckoutSession);

export default router;

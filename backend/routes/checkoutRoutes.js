import express from "express";
import {
  validateCartHandler,
  createCheckoutSession,
  acceptOrder,
  declineOrder,
  requestCancelOrder,
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

/**
 * DT-543: Accept an order on hold, capture Stripe funds, purchase postage label, transition to 'accepted'.
 */
router.post("/orders/:id/accept", requireAuth, acceptOrder);

/**
 * Decline an order on hold: release Stripe authorization hold, transition to 'cancelled', and notify customer.
 */
router.post("/orders/:id/decline", requireAuth, declineOrder);

/**
 * Customer cancellation request while order is on hold (notifies store admin).
 */
router.post("/orders/:id/request-cancel", requestCancelOrder);

export default router;

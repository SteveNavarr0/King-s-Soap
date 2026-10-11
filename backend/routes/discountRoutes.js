import express from "express";
import { getAllDiscounts, getDiscountById, createDiscount, updateDiscount, archiveDiscount } from "../controllers/discountController.js";
import { requireTokenAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

//Signed in user can retrieve the discount list (will eventually be admin only)
router.get("/", requireTokenAuth, getAllDiscounts);

// Load one discount's saved values for the update popup.
router.get("/:id", requireTokenAuth, getDiscountById);

//Signed in user can create a discount
router.post("/", requireTokenAuth, createDiscount);

// Save changes to the discount selected from an admin tile.
router.patch("/:id", requireTokenAuth, updateDiscount);

// Archive a discount selected from an admin tile.
router.patch("/:id/archive", requireTokenAuth, archiveDiscount);

export default router;
import Stripe from "stripe";
import supabase from "../supabaseClient.js";

// Use the backend's secret key for Stripe requests.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// Retrieve discounts from db
export const getAllDiscounts = async (req, res) => {
    try {
        const { data, error } = await supabase
        .from("discounts")
        .select("id, code, type, value, starts_at, expires_at, is_active, stripe_coupon_id, stripe_promotion_code_id, created_at")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    //Error handling
    if (error) {
        console.error("Could not fetch discounts:", error);
        return res.status(500).json({ message: "Failed to load discounts." });
    }

    return res.status(200).json({ discounts: data });
    } catch (error) {
        console.error("Unexpected error fetching discounts:", error);
        return res.status(500).json({ message: "Failed to load discounts." });
    }
};









// Hide a discount while keeping its saved details and Stripe IDs.
export const archiveDiscount = async (req, res) => {
    try {
        const { data: discount, error: lookupError } = await supabase
            .from("discounts")
            .select("id, is_active, stripe_promotion_code_id")
            .eq("id", req.params.id)
            .eq("is_archived", false)
            .maybeSingle();

        if (lookupError) {
            console.error("Could not load discount for archiving:", lookupError);
            return res.status(500).json({ message: "Failed to load this discount." });
        }

        if (!discount) {
            return res.status(404).json({ message: "Discount not found." });
        }

        // Disable an active code in Stripe before hiding its database record.
        if (discount.is_active) {
            try {
                await stripe.promotionCodes.update(
                    discount.stripe_promotion_code_id,
                    { active: false }
                );
            } catch (stripeError) {
                console.error("Could not deactivate discount in Stripe:", stripeError);
                return res.status(502).json({ message: "Failed to deactivate discount in Stripe." });
            }
        }

        const { data: archivedDiscount, error: updateError } = await supabase
            .from("discounts")
            .update({ is_active: false, is_archived: true })
            .eq("id", discount.id)
            .eq("is_archived", false)
            .select()
            .single();

        if (updateError) {
            console.error("Could not archive discount:", updateError);

            // Restore the Stripe code if saving the archive failed.
            if (discount.is_active) {
                try {
                    await stripe.promotionCodes.update(
                        discount.stripe_promotion_code_id,
                        { active: true }
                    );
                } catch (restoreError) {
                    console.error("Could not restore Stripe promotion status:", restoreError);
                }
            }

            return res.status(500).json({ message: "Failed to archive discount." });
        }

        return res.status(200).json({
            message: "Discount archived successfully.",
            discount: archivedDiscount,
        });
    } catch (error) {
        console.error("Unexpected error archiving discount:", error);
        return res.status(500).json({ message: "Failed to archive discount." });
    }
};








// Load the selected discount so the update popup can show its saved values
export const getDiscountById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("discounts")
            .select("id, code, type, value, starts_at, expires_at, is_active")
            .eq("id", req.params.id)
            .single();

        if (error || !data) {
            console.error("Could not load selected discount:", error);
            return res.status(404).json({ message: "Discount not found." });
        }

        return res.status(200).json({ discount: data });
    } catch (error) {
        console.error("Unexpected error loading selected discount:", error);
        return res.status(500).json({ message: "Failed to load this discount." });
    }
};








// Check the required fields 
const validateDiscountFields = ({ code, type, value }) => {
  const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";
  const numericValue = Number(value);

  if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
    return { error: "Enter a discount code using letters and numbers only." };
  }

  if (type !== "percentage" && type !== "fixed") {
    return { error: "Select a percentage or fixed-amount discount." };
  }

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return { error: "Enter a discount value greater than zero." };
  }

  if (type === "percentage" && numericValue > 100) {
    return { error: "A percentage discount cannot exceed 100%." };
  }

  //Match the dbs two decimal limit without floating point multiplication
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
    return { error: "Enter a value with no more than two decimal places." };
  }

  return { code: normalizedCode, type, value: numericValue };
};






//Validate optional dates and convert them to timestamps for db
const validateDiscountDates = ({ starts_at, expires_at }) => {
  const start = starts_at ? new Date(starts_at) : null;
  const expiration = expires_at ? new Date(expires_at) : null;

  if (start && Number.isNaN(start.getTime())) {
    return { error: "Enter a valid start date." };
  }

  if (expiration && Number.isNaN(expiration.getTime())) {
    return { error: "Enter a valid expiration date." };
  }

  if (expiration && expiration.getTime() <= Date.now()) {
    return { error: "The expiration date must be in the future." };
  }

  if (start && expiration && expiration <= start) {
    return { error: "The expiration date must come after the start date." };
  }

  return {
    starts_at: start ? start.toISOString() : null,
    expires_at: expiration ? expiration.toISOString() : null,
  };
};






//Validate new discount before creating its Stripe and db records
export const createDiscount = async (req, res) => {
    const fields = validateDiscountFields(req.body);
    
    if (fields.error) {
        return res.status(400).json({ message: fields.error });
    }

    const dates = validateDiscountDates(req.body);

    if (dates.error) {
        return res.status(400).json({ message: dates.error });
    }



  //Default new discounts to active
    const isActive = req.body.is_active ?? true;

    if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Active status must be true or false." });
    }



    //check for existing code before creating anything in Stripe.
    try {
        const { data: existingDiscount, error: lookupError } = await supabase
            .from("discounts")
            .select("id")
            .eq("code", fields.code)
            .maybeSingle();

        if (lookupError) {
            console.error("Could not check discount code:", lookupError);
            return res.status(500).json({ message: "Could not check the discount code." });
        }

        if (existingDiscount) {
            return res.status(409).json({ message: "That discount code already exists." });
        }
    } catch (error) {
        console.error("Unexpected error checking discount code:", error);
        return res.status(500).json({ message: "Could not check the discount code." });
    }



    //Reject duplicate codes
    const { data: existingDiscount, error: lookupError } = await supabase
    .from("discounts")
    .select("id")
    .eq("code", fields.code)
    .maybeSingle();

    if (lookupError) {
        console.error("Could not check discount code:", lookupError);
        return res.status(500).json({ message: "Could not check the discount code." });
    }

    if (existingDiscount) {
        return res.status(409).json({ message: "That discount code already exists." });
    }


    //Use stripes coupon settings
    const couponSettings = fields.type === "percentage"
        ? {
            duration: "once",
            percent_off: fields.value,
          }
        : {
            duration: "once",
            amount_off: Math.round(fields.value * 100),
            currency: "usd",
          };



    //Create the actual coupon
    let coupon;

    try {
        coupon = await stripe.coupons.create(couponSettings);
    } catch (error) {
        console.error("Could not create Stripe coupon:", error);
        return res.status(502).json({ message: "Failed to create the discount in Stripe." });
    }



    //Link customer facing code to the coupon created above
    let promotionCode;

    try {
        promotionCode = await stripe.promotionCodes.create({
            promotion: {
                type: "coupon",
                coupon: coupon.id,
            },
            code: fields.code,
            active: isActive,
            ...(dates.expires_at && {
                expires_at: Math.floor(new Date(dates.expires_at).getTime() / 1000),
            }),
        });
    } catch (error) {
        console.error("Could not create Stripe promotion code:", error);

        //remove the unused coupon if promo code could not be created
        try {
            await stripe.coupons.del(coupon.id);
        } catch (cleanupError) {
            console.error("Could not clean up Stripe coupon:", cleanupError);
        }

        return res.status(502).json({ message: "Failed to create the discount code in Stripe." });
    }

    //Save the admin settings and IDs returned by Stripe in db
    let savedDiscount;
    let saveError;

    try {
        const result = await supabase
            .from("discounts")
            .insert({
                code: fields.code,
                type: fields.type,
                value: fields.value,
                starts_at: dates.starts_at,
                expires_at: dates.expires_at,
                is_active: isActive,
                stripe_coupon_id: coupon.id,
                stripe_promotion_code_id: promotionCode.id,
            })
            .select()
            .single();

        savedDiscount = result.data;
        saveError = result.error;
    } catch (error) {
        saveError = error;
    }

    if (saveError || !savedDiscount) {
        console.error("Could not save discount in Supabase:", saveError);

        //Disable the promotion code
        try {
            await stripe.promotionCodes.update(promotionCode.id, { active: false });
        } catch (cleanupError) {
            console.error("Could not deactivate Stripe promotion code:", cleanupError);
        }

        //remove the coupon created for failed save
        try {
            await stripe.coupons.del(coupon.id);
        } catch (cleanupError) {
            console.error("Could not clean up Stripe coupon:", cleanupError);
        }

        if (saveError?.code === "23505") {
            return res.status(409).json({ message: "That discount code already exists." });
        }

        return res.status(500).json({ message: "Failed to save the discount." });
    }

    return res.status(201).json({
        message: "Discount created successfully.",
        discount: savedDiscount,
    });

};







// Validate proposed edits before changing Stripe or Supabase.
export const updateDiscount = async (req, res) => {
    const fields = validateDiscountFields(req.body);

    if (fields.error) {
        return res.status(400).json({ message: fields.error });
    }

    const dates = validateDiscountDates(req.body);

    if (dates.error) {
        return res.status(400).json({ message: dates.error });
    }

    const isActive = req.body.is_active;

    if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Active status must be true or false." });
    }



        // Load the saved discount and its current Stripe IDs before applying edits.
    try {
        const { data: existingDiscount, error: lookupError } = await supabase
            .from("discounts")
            .select("id, code, type, value, starts_at, expires_at, is_active, stripe_coupon_id, stripe_promotion_code_id")
            .eq("id", req.params.id)
            .maybeSingle();

        if (lookupError) {
            console.error("Could not load discount for update:", lookupError);
            return res.status(500).json({ message: "Failed to load this discount." });
        }

        if (!existingDiscount) {
            return res.status(404).json({ message: "Discount not found." });
        }


        // Stripe requires replacement objects when the code, type, or value changes.
        const stripeDetailsChanged =
            fields.code !== existingDiscount.code ||
            fields.type !== existingDiscount.type ||
            fields.value !== Number(existingDiscount.value);


        // A renamed code must not belong to another saved discount.
        if (fields.code !== existingDiscount.code) {
            const { data: duplicate, error: duplicateError } = await supabase
                .from("discounts")
                .select("id")
                .eq("code", fields.code)
                .neq("id", existingDiscount.id)
                .maybeSingle();

            if (duplicateError) {
                console.error("Could not check updated discount code:", duplicateError);
                return res.status(500).json({ message: "Could not check the discount code." });
            }

            if (duplicate) {
                return res.status(409).json({ message: "That discount code already exists." });
            }
        }



        // Keep Stripe and Supabase in sync when only dates or active status change.
        if (!stripeDetailsChanged) {
            if (isActive !== existingDiscount.is_active) {
                try {
                    await stripe.promotionCodes.update(
                        existingDiscount.stripe_promotion_code_id,
                        { active: isActive }
                    );
                } catch (stripeError) {
                    console.error("Could not change Stripe promotion status:", stripeError);
                    return res.status(502).json({ message: "Failed to change discount status in Stripe." });
                }
            }

            const { data: updatedDiscount, error: updateError } = await supabase
                .from("discounts")
                .update({
                    starts_at: dates.starts_at,
                    expires_at: dates.expires_at,
                    is_active: isActive,
                })
                .eq("id", existingDiscount.id)
                .select()
                .single();

            if (updateError) {
                console.error("Could not update discount:", updateError);

                // Restore Stripe's previous status if the database save failed.
                if (isActive !== existingDiscount.is_active) {
                    try {
                        await stripe.promotionCodes.update(
                            existingDiscount.stripe_promotion_code_id,
                            { active: existingDiscount.is_active }
                        );
                    } catch (restoreError) {
                        console.error("Could not restore Stripe promotion status:", restoreError);
                    }
                }

                return res.status(500).json({ message: "Failed to save discount changes." });
            }

            return res.status(200).json({
                message: "Discount updated successfully.",
                discount: updatedDiscount,
            });
        }



        // Build a new coupon because Stripe cannot edit an existing coupon's type or value.
        const replacementCouponSettings = fields.type === "percentage"
            ? {
                duration: "once",
                percent_off: fields.value,
            }
            : {
                duration: "once",
                amount_off: Math.round(fields.value * 100),
                currency: "usd",
            };



        // Create the replacement coupon before changing the saved discount.
        let replacementCoupon;

        try {
            replacementCoupon = await stripe.coupons.create(replacementCouponSettings);
        } catch (stripeError) {
            console.error("Could not create replacement coupon:", stripeError);
            return res.status(502).json({ message: "Failed to update the discount in Stripe." });
        }


        // Prepare the new code without making it redeemable yet.
        let replacementPromotionCode;

        try {
            replacementPromotionCode = await stripe.promotionCodes.create({
                promotion: {
                    type: "coupon",
                    coupon: replacementCoupon.id,
                },
                code: fields.code,
                active: false,
                ...(dates.expires_at && {
                    expires_at: Math.floor(new Date(dates.expires_at).getTime() / 1000),
                }),
            });
        } catch (stripeError) {
            console.error("Could not create replacement promotion code:", stripeError);

            // Remove the replacement coupon if its code could not be prepared.
            try {
                await stripe.coupons.del(replacementCoupon.id);
            } catch (cleanupError) {
                console.error("Could not clean up replacement coupon:", cleanupError);
            }

            return res.status(502).json({ message: "Failed to prepare the updated discount in Stripe." });
        }



        // Free the old customer-facing code before activating its replacement.
        try {
            await stripe.promotionCodes.update(
                existingDiscount.stripe_promotion_code_id,
                { active: false }
            );
        } catch (stripeError) {
            console.error("Could not deactivate old promotion code:", stripeError);

            // The replacement is unused, so remove its coupon.
            try {
                await stripe.coupons.del(replacementCoupon.id);
            } catch (cleanupError) {
                console.error("Could not clean up replacement coupon:", cleanupError);
            }

            return res.status(502).json({ message: "Failed to replace the discount code in Stripe." });
        }


        // Keep the replacement inactive when the admin unchecked Active.
        if (isActive) {
            try {
                await stripe.promotionCodes.update(
                    replacementPromotionCode.id,
                    { active: true }
                );
            } catch (stripeError) {
                console.error("Could not activate replacement promotion code:", stripeError);

                // Restore the old code because the database still points to it.
                try {
                    await stripe.promotionCodes.update(
                        existingDiscount.stripe_promotion_code_id,
                        { active: true }
                    );
                } catch (restoreError) {
                    console.error("Could not restore old promotion code:", restoreError);
                }

                try {
                    await stripe.coupons.del(replacementCoupon.id);
                } catch (cleanupError) {
                    console.error("Could not clean up replacement coupon:", cleanupError);
                }

                return res.status(502).json({ message: "Failed to activate the updated discount." });
            }
        }



        // Switch the saved record to the new Stripe objects and edited values.
        let updatedDiscount;
        let updateError;

        try {
            const result = await supabase
                .from("discounts")
                .update({
                    code: fields.code,
                    type: fields.type,
                    value: fields.value,
                    starts_at: dates.starts_at,
                    expires_at: dates.expires_at,
                    is_active: isActive,
                    stripe_coupon_id: replacementCoupon.id,
                    stripe_promotion_code_id: replacementPromotionCode.id,
                })
                .eq("id", existingDiscount.id)
                .select()
                .single();

            updatedDiscount = result.data;
            updateError = result.error;
        } catch (databaseError) {
            updateError = databaseError;
        }

        if (updateError || !updatedDiscount) {
            console.error("Could not save updated discount:", updateError);

            // Undo the new Stripe code and restore the code still saved in Supabase.
            try {
                await stripe.promotionCodes.update(
                    replacementPromotionCode.id,
                    { active: false }
                );
                await stripe.promotionCodes.update(
                    existingDiscount.stripe_promotion_code_id,
                    { active: existingDiscount.is_active }
                );
            } catch (restoreError) {
                console.error("Could not restore previous promotion code:", restoreError);
            }

            try {
                await stripe.coupons.del(replacementCoupon.id);
            } catch (cleanupError) {
                console.error("Could not clean up replacement coupon:", cleanupError);
            }

            if (updateError?.code === "23505") {
                return res.status(409).json({ message: "That discount code already exists." });
            }

            return res.status(500).json({ message: "Failed to save discount changes." });
        }

        return res.status(200).json({
            message: "Discount updated successfully.",
            discount: updatedDiscount,
        });


    } catch (error) {
        console.error("Unexpected error loading discount for update:", error);
        return res.status(500).json({ message: "Failed to load this discount." });
    }

};
import supabase from "../supabaseClient.js";

/**
 * Authentication middleware that extracts the Supabase user from the Authorization header.
 * Falls back to req.body.userId or req.query.userId for development/testing flexibility.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (token) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired authentication token.",
        });
      }

      req.user = user;
      req.authToken = token;
      return next();
    }

    // Fallback for development/testing when userId is provided directly
    const fallbackUserId = req.body?.userId || req.query?.userId;
    if (fallbackUserId) {
      req.user = {
        id: fallbackUserId,
        email: req.body?.email || req.query?.email || null,
      };
      req.authToken = null;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid bearer token or user ID.",
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal authentication error.",
    });
  }
};




//For discounts - requires a real Supabase session token for routes that manage discounts
//Will eventually add admin check
export const requireTokenAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Sign in to manage discounts.",
            });
        }

        const token = authHeader.slice("Bearer ".length);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                message: "Your session is invalid or has expired.",
            });
        }

        //Make verified user available to later route handlers
        req.user = user;
        req.authToken = token;
        return next();
    } catch (error) {
        console.error("Discount authentication error:", error);
        return res.status(500).json({
            message: "Could not verify your session.",
        });
    }
};

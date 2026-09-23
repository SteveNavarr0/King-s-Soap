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
      req.user = { id: fallbackUserId };
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

import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/users/verify-role
 * @desc Verify user's role and existence in database
 * @access Private (requires valid JWT)
 */
router.get("/verify-role", requireAuth, async (req, res) => {
  try {
    console.log("[ROLE] Verifying role for user:", req.user.sub);
    
    // Find user by clerkId from JWT
    const user = await User.findOne({ clerkId: req.user.sub }).select("role email").lean();

    if (!user) {
      console.log("[ROLE] User not found in database");
      return res.status(404).json({
        exists: false,
        message: "User not found in database"
      });
    }

    console.log("[ROLE] User found with role:", user.role);
    return res.json({
      exists: true,
      role: user.role,
      email: user.email,
      isConsistent: true
    });

  } catch (error) {
    console.error("[ROLE] Verification error:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify user role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
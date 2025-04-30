import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/update-role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const { sub: clerkId, email } = req.user; // Destructure from authenticated user

    if (!role || !clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${!clerkId ? 'clerkId ' : ''}${!email ? 'email ' : ''}${!role ? 'role' : ''}`
      });
    }

    // Try to find user by clerkId
    let user = await User.findOne({ clerkId });

    if (!user) {
      // User doesn't exist - create new record
      user = new User({
        clerkId,
        email,
        role
      });
      await user.save();
      console.log("New user registered:", { clerkId, email });
    } else if (user.email !== email) {
      // Update email if different
      user.email = email;
      await user.save();
      console.log("User email updated:", { clerkId, email });
    }

    // Update role
    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Database operation failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update user record",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

export default router;
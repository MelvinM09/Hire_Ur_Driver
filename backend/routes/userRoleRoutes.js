import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Check user role by clerkId
router.get("/check-role/:clerkUserId", requireAuth, async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const user = await User.findOne({ clerkId: clerkUserId });
    if (user) {
      return res.json({ exists: true, role: user.role });
    } else {
      return res.json({ exists: false, role: null });
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
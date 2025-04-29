import { verifyToken } from "@clerk/clerk-sdk-node";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization header missing" 
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: ['http://localhost:5173', 'http://localhost:5000']
    });

    // Extract email correctly from payload
    const email = typeof payload.email === 'string' 
      ? payload.email 
      : payload.email?.email_address;

    if (!payload.sub || !email) {
      console.error("Invalid token payload:", {
        userId: payload.sub,
        email: payload.email
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    req.user = {
      sub: payload.sub,
      email: email
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};
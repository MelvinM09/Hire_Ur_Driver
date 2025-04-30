import { verifyToken } from "@clerk/clerk-sdk-node";

export const requireAuth = async (req, res, next) => {
  try {
    console.log("[AUTH] Incoming request headers:", req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[AUTH] No Bearer token found");
      return res.status(401).json({ 
        success: false,
        message: "Authorization header missing" 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Token received (first 30 chars):", token.substring(0, 30) + "...");

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: ['http://localhost:5173', 'http://localhost:5000'],
      skipJwksCache: true
    });

    console.log("[AUTH] Full token payload:", JSON.stringify(payload, null, 2));

    // Extract claims based on your JWT template
    const userId = payload.user_id || payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (!userId || !email) {
      console.error("[AUTH] Invalid token payload - missing required claims:", {
        userIdPresent: !!userId,
        emailPresent: !!email,
        rolePresent: !!role
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        missingFields: {
          userId: !userId,
          email: !email
        }
      });
    }

    req.user = {
      sub: userId,
      email: email,
      role: role // Now available from token directly
    };

    console.log("[AUTH] Authentication successful for:", {
      userId: req.user.sub,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (err) {
    console.error("[AUTH] Verification failed:", {
      message: err.message,
      stack: err.stack
    });
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
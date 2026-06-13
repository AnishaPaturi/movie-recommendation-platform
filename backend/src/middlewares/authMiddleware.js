import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");

      // Attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ error: "Not authorized, token verification failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, token is missing" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as an admin" });
  }
};

export { protect, admin };

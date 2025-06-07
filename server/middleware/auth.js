import jwt from "jsonwebtoken";
import User from "../models/User.js";

//middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    
    if (!token) {
      console.log(token)
      return res.json({ success: false, message: "Token is required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-pw");
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};



import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// ─── Auth: verify any logged-in user ──────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return res.json({ success: false, message: "Not authorized. Please login." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    res.json({ success: false, message: "Invalid or expired token" });
  }
};

// ─── Admin: verify user has role=admin ────────────────────────────────────────
const adminMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return res.json({ success: false, message: "Not authorized. Please login." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("role isActive");
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.role !== "admin") return res.json({ success: false, message: "Admin access required" });
    if (!user.isActive) return res.json({ success: false, message: "Account deactivated" });
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    res.json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
export { adminMiddleware };

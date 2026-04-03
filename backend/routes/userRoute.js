import express from "express";
import {
  loginUser,
  registerUser,
  registerAdmin,
  registerRestaurant,
  registerDelivery,
  listUsers,
  toggleUserActive,
  deleteUser,
  seedAdmin,
} from "../controllers/userController.js";
import authMiddleware, { adminMiddleware } from "../middleware/auth.js";

const userRouter = express.Router();

// ─── Public routes ─────────────────────────────────────────────────────────────
userRouter.post("/register", registerUser);           // Register normal user
userRouter.post("/login", loginUser);                 // Login (all roles)
userRouter.post("/seed-admin", seedAdmin);            // Create FIRST admin (one-time use)

// ─── Admin-only routes ─────────────────────────────────────────────────────────
userRouter.post("/register/admin", adminMiddleware, registerAdmin);           // Create new admin
userRouter.post("/register/restaurant", adminMiddleware, registerRestaurant); // Create restaurant user
userRouter.post("/register/delivery", adminMiddleware, registerDelivery);     // Create delivery user

userRouter.get("/list", adminMiddleware, listUsers);                          // List users (optional ?role=)
userRouter.put("/toggle-active/:userId", adminMiddleware, toggleUserActive);  // Activate/deactivate
userRouter.delete("/:userId", adminMiddleware, deleteUser);                   // Delete user

export default userRouter;

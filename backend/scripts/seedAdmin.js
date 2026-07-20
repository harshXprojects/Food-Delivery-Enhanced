/**
 * One-time script to create the first admin user in MongoDB.
 * Usage:  node scripts/seedAdmin.js
 * 
 * Edit ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD below before running.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// ── Edit these before running ──────────────────────────────────────────────────
const ADMIN_NAME     = "Super Admin";
const ADMIN_EMAIL    = "admin@fooddelivery.com";
const ADMIN_PASSWORD = "Admin@12345";   // must be 8+ chars
// ──────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: "user" },
    cartData: { type: Object, default: {} },
    favorites:{ type: [String], default: [] },
    restaurantName: { type: String, default: "" },
    isAvailable:    { type: Boolean, default: true },
    currentOrderId: { type: String, default: null },
    isActive:       { type: Boolean, default: true },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.model("user", userSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("⚠️  An admin already exists:", existing.email);
      console.log("   Login to the admin panel to create additional admins.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    }).save();

    console.log("✅ Admin created successfully!");
    console.log("   Email:   ", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("\n👉 Now login at http://localhost:5173 (admin panel)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();

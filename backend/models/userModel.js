import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "restaurant", "delivery"],
    },
    // ── Regular user fields ───────────────────────────────────────────
    cartData: { type: Object, default: {} },
    favorites: { type: [String], default: [] },
    // ── Restaurant fields ─────────────────────────────────────────────
    restaurantName: { type: String, default: "" },
    // ── Delivery fields ───────────────────────────────────────────────
    isAvailable: { type: Boolean, default: true },
    currentOrderId: { type: String, default: null },
    // ── Admin control ─────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;

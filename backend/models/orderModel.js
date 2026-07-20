import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  // Status options: "Food Processing" | "Out for delivery" | "Delivered" | "Cancelled"
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false },
  cancelledAt: { type: Date, default: null },
  cancelReason: { type: String, default: "" },
  deliveryPartnerId: { type: String, default: null },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;

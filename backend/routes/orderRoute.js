import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  listOrders, placeOrder, updateStatus, userOrders, verifyOrder,
  cancelOrder, reOrder,
  deliveryOrders, acceptDelivery, markDelivered,
  restaurantOrders, restaurantUpdateStatus,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// User
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/cancel", authMiddleware, cancelOrder);
orderRouter.post("/reorder", authMiddleware, reOrder);

// Admin
orderRouter.post("/status", authMiddleware, updateStatus);
orderRouter.get("/list", authMiddleware, listOrders);

// Delivery partner
orderRouter.post("/delivery/list", authMiddleware, deliveryOrders);
orderRouter.post("/delivery/accept", authMiddleware, acceptDelivery);
orderRouter.post("/delivery/delivered", authMiddleware, markDelivered);

// Restaurant partner
orderRouter.post("/restaurant/list", authMiddleware, restaurantOrders);
orderRouter.post("/restaurant/status", authMiddleware, restaurantUpdateStatus);

export default orderRouter;

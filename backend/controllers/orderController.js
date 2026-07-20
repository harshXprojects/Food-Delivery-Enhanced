import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://food-delivery-frontend-s2l9.onrender.com";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Cancel order — only allowed if status is "Food Processing"
const cancelOrder = async (req, res) => {
  const { orderId, cancelReason } = req.body;
  const userId = req.body.userId;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });
    if (order.userId !== userId)
      return res.json({ success: false, message: "Unauthorized" });
    if (order.status !== "Food Processing")
      return res.json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });

    await orderModel.findByIdAndUpdate(orderId, {
      status: "Cancelled",
      cancelledAt: new Date(),
      cancelReason: cancelReason || "Cancelled by user",
    });
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Reorder — loads items from a past order back into cart
const reOrder = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.body.userId;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });
    if (order.userId !== userId)
      return res.json({ success: false, message: "Unauthorized" });

    // Build cartData from order items
    const cartData = {};
    order.items.forEach((item) => {
      cartData[item._id] = item.quantity;
    });

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Items added to cart", cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({}).sort({ date: -1 });
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && (userData.role === "admin" || userData.role === "restaurant" || userData.role === "delivery")) {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "Not authorized" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Delivery partner: get orders assigned to them or all active orders
const deliveryOrders = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "delivery")
      return res.json({ success: false, message: "Not authorized" });

    // Show orders that are "Food Processing" or assigned to this delivery partner
    const orders = await orderModel.find({
      $or: [
        { deliveryPartnerId: userId },
        { status: "Ready for Pickup", deliveryPartnerId: null },
      ],
    }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Delivery partner: accept an order
const acceptDelivery = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "delivery")
      return res.json({ success: false, message: "Not authorized" });

    await orderModel.findByIdAndUpdate(orderId, {
      deliveryPartnerId: userId,
      status: "Out for delivery",
    });
    await userModel.findByIdAndUpdate(userId, { currentOrderId: orderId, isAvailable: false });
    res.json({ success: true, message: "Order accepted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Delivery partner: mark order as delivered
const markDelivered = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "delivery")
      return res.json({ success: false, message: "Not authorized" });

    await orderModel.findByIdAndUpdate(orderId, { status: "Delivered" });
    await userModel.findByIdAndUpdate(userId, { currentOrderId: null, isAvailable: true });
    res.json({ success: true, message: "Order marked as delivered" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Restaurant partner: get orders for their restaurant
const restaurantOrders = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "restaurant")
      return res.json({ success: false, message: "Not authorized" });

    const orders = await orderModel.find({ status: { $nin: ["Cancelled"] } }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Restaurant partner: update order status (Food Processing → Ready for Pickup)
const restaurantUpdateStatus = async (req, res) => {
  const { orderId, status } = req.body;
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "restaurant")
      return res.json({ success: false, message: "Not authorized" });

    const allowed = ["Food Processing", "Ready for Pickup"];
    if (!allowed.includes(status))
      return res.json({ success: false, message: "Invalid status" });

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export {
  placeOrder, verifyOrder, userOrders, listOrders, updateStatus,
  cancelOrder, reOrder,
  deliveryOrders, acceptDelivery, markDelivered,
  restaurantOrders, restaurantUpdateStatus,
};


import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./DeliveryDashboard.css";

const DeliveryDashboard = ({ url, token }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // "available" | "my"

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/delivery/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/delivery/accept",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order accepted! Head to the restaurant.");
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to accept order");
    }
  };

  const markDelivered = async (orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/delivery/delivered",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order marked as delivered! Great job 🎉");
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const availableOrders = orders.filter((o) => o.status === "Ready for Pickup");
  const myOrders = orders.filter((o) => o.status === "Out for delivery");

  return (
    <div className="delivery-dashboard">
      <div className="dashboard-header">
        <h2>🚴 Delivery Dashboard</h2>
        <button className="refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{availableOrders.length}</span>
          <span className="stat-label">Available Pickups</span>
        </div>
        <div className="stat-card active-stat">
          <span className="stat-number">{myOrders.length}</span>
          <span className="stat-label">Active Deliveries</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="delivery-tabs">
        <button
          className={`delivery-tab ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          📦 Available Orders ({availableOrders.length})
        </button>
        <button
          className={`delivery-tab ${activeTab === "my" ? "active" : ""}`}
          onClick={() => setActiveTab("my")}
        >
          🚴 My Deliveries ({myOrders.length})
        </button>
      </div>

      <div className="orders-list">
        {activeTab === "available" && (
          <>
            {availableOrders.length === 0 ? (
              <div className="empty-state">No pickups available right now. Check back soon!</div>
            ) : (
              availableOrders.map((order, i) => (
                <div key={i} className="delivery-order-card">
                  <div className="delivery-order-header">
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-badge pickup">Ready for Pickup</span>
                  </div>
                  <div className="delivery-order-body">
                    <div className="delivery-info">
                      <p><strong>👤 Customer:</strong> {order.address?.firstName} {order.address?.lastName}</p>
                      <p><strong>📞 Phone:</strong> {order.address?.phone}</p>
                      <p><strong>📍 Deliver to:</strong> {order.address?.street}, {order.address?.city}, {order.address?.state}</p>
                    </div>
                    <div className="items-summary">
                      <strong>🍔 Items:</strong>
                      <p>{order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
                    </div>
                    <div className="order-value">
                      <strong>💰 Order Value: ${order.amount}</strong>
                    </div>
                  </div>
                  <button className="accept-btn" onClick={() => acceptOrder(order._id)}>
                    ✅ Accept & Pick Up
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "my" && (
          <>
            {myOrders.length === 0 ? (
              <div className="empty-state">No active deliveries. Accept an order to start!</div>
            ) : (
              myOrders.map((order, i) => (
                <div key={i} className="delivery-order-card active-delivery">
                  <div className="delivery-order-header">
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-badge delivering">Out for Delivery</span>
                  </div>
                  <div className="delivery-order-body">
                    <div className="delivery-info">
                      <p><strong>👤 Customer:</strong> {order.address?.firstName} {order.address?.lastName}</p>
                      <p><strong>📞 Phone:</strong> {order.address?.phone}</p>
                      <p><strong>📍 Address:</strong> {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipcode}</p>
                    </div>
                    <div className="items-summary">
                      <strong>🍔 Items:</strong>
                      <p>{order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
                    </div>
                    <div className="order-value">
                      <strong>💰 Order Value: ${order.amount}</strong>
                    </div>
                  </div>
                  <button className="delivered-btn" onClick={() => markDelivered(order._id)}>
                    🏁 Mark as Delivered
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;

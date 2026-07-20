import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RestaurantOrders.css";

const STATUS_COLORS = {
  "Food Processing": "#ffc107",
  "Ready for Pickup": "#007bff",
  "Out for delivery": "#fd7e14",
  "Delivered": "#28a745",
  "Cancelled": "#dc3545",
};

const RestaurantOrders = ({ url, token }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/restaurant/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        url + "/api/order/restaurant/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated!");
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = filter === "All"
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="restaurant-orders">
      <div className="restaurant-orders-header">
        <h2>📋 Incoming Orders</h2>
        <button className="refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {["All", "Food Processing", "Ready for Pickup"].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            <span className="tab-count">
              {tab === "All"
                ? orders.length
                : orders.filter((o) => o.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 && (
          <div className="no-orders">No orders in this category.</div>
        )}
        {filteredOrders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-card-header">
              <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
              <span
                className="order-status-badge"
                style={{ background: STATUS_COLORS[order.status] + "22", color: STATUS_COLORS[order.status] }}
              >
                {order.status}
              </span>
            </div>

            <div className="order-card-body">
              <div className="order-customer">
                <strong>👤 {order.address?.firstName} {order.address?.lastName}</strong>
                <p>📞 {order.address?.phone}</p>
                <p>📍 {order.address?.street}, {order.address?.city}</p>
              </div>

              <div className="order-items-list">
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
              </div>

              <div className="order-footer">
                <span className="order-total">💰 ${order.amount}</span>
                <span className="order-time">
                  {new Date(order.date).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {order.status === "Food Processing" && (
              <button
                className="ready-btn"
                onClick={() => handleStatusUpdate(order._id, "Ready for Pickup")}
              >
                ✅ Mark Ready for Pickup
              </button>
            )}
            {order.status === "Ready for Pickup" && (
              <div className="waiting-badge">⏳ Waiting for delivery partner</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantOrders;

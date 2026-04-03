import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token, reOrder } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    if (response.data.success) {
      setData(response.data.data);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const response = await axios.post(
      url + "/api/order/cancel",
      { orderId: cancelModalOrder._id, cancelReason },
      { headers: { token } }
    );
    if (response.data.success) {
      toast.success("Order cancelled successfully");
      setCancelModalOrder(null);
      setCancelReason("");
      fetchOrders();
    } else {
      toast.error(response.data.message);
    }
  };

  const handleReOrder = async (orderId) => {
    const success = await reOrder(orderId);
    if (success) navigate("/cart");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "#28a745";
      case "Cancelled": return "#dc3545";
      case "Out for delivery": return "#fd7e14";
      case "Ready for Pickup": return "#007bff";
      default: return "#ffc107";
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <div className="order-info">
              <p className="order-items">
                {order.items.map((item, i) =>
                  i === order.items.length - 1
                    ? item.name + " x " + item.quantity
                    : item.name + " x " + item.quantity + ", "
                )}
              </p>
              <p className="order-date">
                {new Date(order.date).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
              {order.cancelReason && (
                <p className="order-cancel-reason">Reason: {order.cancelReason}</p>
              )}
            </div>
            <p className="order-amount">${order.amount}.00</p>
            <p className="order-items-count">Items: {order.items.length}</p>
            <p className="order-status" style={{ color: getStatusColor(order.status) }}>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>
            <div className="order-actions">
              <button className="btn-track" onClick={fetchOrders}>Track</button>
              <button
                className="btn-reorder"
                onClick={() => handleReOrder(order._id)}
                title="Add all items back to cart"
              >
                🔁 Reorder
              </button>
              {order.status === "Food Processing" && (
                <button
                  className="btn-cancel"
                  onClick={() => setCancelModalOrder(order)}
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="no-orders">No orders found. Start ordering!</p>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModalOrder && (
        <div className="cancel-modal-overlay" onClick={() => setCancelModalOrder(null)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            <div className="cancel-modal-actions">
              <button className="btn-confirm-cancel" onClick={handleCancelOrder}>
                Yes, Cancel Order
              </button>
              <button className="btn-keep" onClick={() => setCancelModalOrder(null)}>
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;


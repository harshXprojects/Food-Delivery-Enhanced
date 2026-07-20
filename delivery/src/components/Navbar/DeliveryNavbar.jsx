import React from "react";
import "./DeliveryNavbar.css";

const DeliveryNavbar = ({ setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem("delivery_token");
    setToken("");
  };
  return (
    <div className="delivery-navbar">
      <div className="delivery-navbar-logo">🚴 <span>Delivery Portal</span></div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DeliveryNavbar;

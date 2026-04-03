import React from "react";
import "./RestaurantNavbar.css";

const RestaurantNavbar = ({ setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem("restaurant_token");
    setToken("");
  };

  return (
    <div className="restaurant-navbar">
      <div className="restaurant-navbar-logo">
        🍽️ <span>Restaurant Portal</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default RestaurantNavbar;

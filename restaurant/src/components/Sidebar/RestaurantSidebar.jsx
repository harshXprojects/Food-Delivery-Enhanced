import React from "react";
import { NavLink } from "react-router-dom";
import "./RestaurantSidebar.css";

const RestaurantSidebar = () => {
  return (
    <div className="restaurant-sidebar">
      <NavLink to="/orders" className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
        <span>📋</span>
        <p>Orders</p>
      </NavLink>
    </div>
  );
};

export default RestaurantSidebar;

import React from "react";
import { NavLink } from "react-router-dom";
import "./DeliverySidebar.css";

const DeliverySidebar = () => (
  <div className="delivery-sidebar">
    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
      <span>🚴</span><p>Dashboard</p>
    </NavLink>
  </div>
);

export default DeliverySidebar;

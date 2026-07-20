import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RestaurantLogin from "./pages/Login/RestaurantLogin";
import RestaurantOrders from "./pages/Orders/RestaurantOrders";
import RestaurantSidebar from "./components/Sidebar/RestaurantSidebar";
import RestaurantNavbar from "./components/Navbar/RestaurantNavbar";
import "./index.css";

const App = () => {
  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("restaurant_token") || "");

  if (!token) {
    return (
      <div>
        <ToastContainer />
        <RestaurantLogin url={url} setToken={setToken} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <RestaurantNavbar setToken={setToken} />
      <hr />
      <div className="app-content">
        <RestaurantSidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/orders" />} />
          <Route path="/orders" element={<RestaurantOrders url={url} token={token} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

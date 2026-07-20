import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeliveryLogin from "./pages/Login/DeliveryLogin";
import DeliveryDashboard from "./pages/Dashboard/DeliveryDashboard";
import DeliveryNavbar from "./components/Navbar/DeliveryNavbar";
import DeliverySidebar from "./components/Sidebar/DeliverySidebar";
import "./index.css";

const App = () => {
  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("delivery_token") || "");

  if (!token) {
    return (
      <div>
        <ToastContainer />
        <DeliveryLogin url={url} setToken={setToken} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <DeliveryNavbar setToken={setToken} />
      <hr />
      <div className="app-content">
        <DeliverySidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DeliveryDashboard url={url} token={token} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

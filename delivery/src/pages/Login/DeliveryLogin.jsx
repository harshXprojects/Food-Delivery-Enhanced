import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./DeliveryLogin.css";

const DeliveryLogin = ({ url, setToken }) => {
  const [data, setData] = useState({ email: "", password: "" });

  const onChangeHandler = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(url + "/api/user/login", data);
    if (response.data.success) {
      if (response.data.role !== "delivery") {
        toast.error("Access denied. Only delivery partner accounts can login here.");
        return;
      }
      localStorage.setItem("delivery_token", response.data.token);
      setToken(response.data.token);
      toast.success("Welcome, Delivery Partner!");
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="delivery-login">
      <div className="delivery-login-container">
        <div className="delivery-login-header">
          <h2>🚴 Delivery Portal</h2>
          <p>Accept & manage delivery orders</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="delivery@example.com"
              value={data.email} onChange={onChangeHandler} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password"
              value={data.password} onChange={onChangeHandler} required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="login-note">Only <strong>delivery partner</strong> accounts can access this portal.</p>
      </div>
    </div>
  );
};

export default DeliveryLogin;

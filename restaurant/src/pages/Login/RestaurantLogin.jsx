import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RestaurantLogin.css";

const RestaurantLogin = ({ url, setToken }) => {
  const [data, setData] = useState({ email: "", password: "" });

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(url + "/api/user/login", data);
    if (response.data.success) {
      if (response.data.role !== "restaurant") {
        toast.error("Access denied. Only restaurant accounts can login here.");
        return;
      }
      localStorage.setItem("restaurant_token", response.data.token);
      setToken(response.data.token);
      toast.success("Welcome back!");
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="restaurant-login">
      <div className="restaurant-login-container">
        <div className="restaurant-login-header">
          <h2>🍽️ Restaurant Portal</h2>
          <p>Manage your incoming orders</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="restaurant@example.com"
              value={data.email}
              onChange={onChangeHandler}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={data.password}
              onChange={onChangeHandler}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="login-note">
          Only accounts with <strong>restaurant</strong> role can access this portal.
        </p>
      </div>
    </div>
  );
};

export default RestaurantLogin;

import React, { useContext, useEffect, useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const Login = ({ url }) => {
  const { admin, setAdmin, token, setToken } = useContext(StoreContext);
  const [data, setData] = useState({ email: "", password: "" });

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(url + "/api/user/login", data);
      if (response.data.success) {
        if (response.data.role === "admin") {
          // FIX: store boolean string so StoreContext can parse it back
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("admin", "true");
          setToken(response.data.token);
          setAdmin(true);   // real boolean in state
          toast.success("Login successful!");
          // App.jsx re-renders automatically since context changed
        } else {
          toast.error("Access denied — admin accounts only.");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("Could not connect to server. Is the backend running?");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>Admin Login</h2>
        </div>
        <div className="login-popup-inputs">
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Admin email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Login</button>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "10px", textAlign: "center" }}>
          First time? Run <code>npm run seed</code> in the backend to create your admin account.
        </p>
      </form>
    </div>
  );
};

export default Login;

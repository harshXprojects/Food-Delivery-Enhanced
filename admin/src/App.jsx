import React, { useContext } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Users from "./pages/Users/Users";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import { StoreContext } from "./context/StoreContext";

const url = "http://localhost:4000";

const App = () => {
  const { token, admin } = useContext(StoreContext);

  // FIX: admin from context is now a real boolean (fixed in StoreContext)
  // Show login screen if not logged in as admin
  if (!token || admin !== true) {
    return (
      <>
        <ToastContainer />
        <Login url={url} />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/"       element={<Add    url={url} />} />
          <Route path="/add"    element={<Add    url={url} />} />
          <Route path="/list"   element={<List   url={url} />} />
          <Route path="/orders" element={<Orders url={url} />} />
          <Route path="/users"  element={<Users  url={url} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

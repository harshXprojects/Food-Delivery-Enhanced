import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./Users.css";

const ROLES = ["admin", "restaurant", "delivery", "user"];

const emptyForm = { name: "", email: "", password: "", restaurantName: "" };

const Users = ({ url }) => {
  const { token } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState("admin");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (role) => {
    try {
      const res = await axios.get(`${url}/api/user/list?role=${role}`, {
        headers: { token },
      });
      if (res.data.success) setUsers(res.data.users);
      else toast.error(res.data.message);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
    setForm(emptyForm);
  }, [activeTab]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      if (activeTab === "restaurant") payload.restaurantName = form.restaurantName;

      const res = await axios.post(`${url}/api/user/register/${activeTab}`, payload, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setForm(emptyForm);
        fetchUsers(activeTab);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Request failed");
    }
    setLoading(false);
  };

  const handleToggle = async (userId, isActive) => {
    try {
      const res = await axios.put(`${url}/api/user/toggle-active/${userId}`, {}, {
        headers: { token },
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(activeTab);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await axios.delete(`${url}/api/user/${userId}`, {
        headers: { token },
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(activeTab);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const tabLabel = (role) => {
    return { admin: "Admins", restaurant: "Restaurants", delivery: "Delivery Partners", user: "Customers" }[role];
  };

  return (
    <div className="users">
      <h2>User Management</h2>

      {/* Role Tabs */}
      <div className="users-tabs">
        {ROLES.map((role) => (
          <button
            key={role}
            className={activeTab === role ? "active" : ""}
            onClick={() => setActiveTab(role)}
          >
            {tabLabel(role)}
          </button>
        ))}
      </div>

      {/* Create Form (not for regular users) */}
      {activeTab !== "user" && (
        <div className="users-create-form">
          <h3>Create New {tabLabel(activeTab).slice(0, -1)}</h3>
          <form onSubmit={handleCreate}>
            <div className="users-form-row">
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={handleChange} required />
              {activeTab === "restaurant" && (
                <input name="restaurantName" placeholder="Restaurant Name" value={form.restaurantName} onChange={handleChange} required />
              )}
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : `Create ${tabLabel(activeTab).slice(0, -1)}`}
            </button>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-wrapper">
        {users.length === 0 ? (
          <div className="empty-state">No {tabLabel(activeTab).toLowerCase()} found.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {activeTab === "restaurant" && <th>Restaurant</th>}
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {activeTab !== "user" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  {activeTab === "restaurant" && <td>{u.restaurantName || "—"}</td>}
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span className={u.isActive ? "status-active" : "status-inactive"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  {activeTab !== "user" && (
                    <td>
                      <button
                        className={`btn-toggle ${u.isActive ? "deactivate" : "activate"}`}
                        onClick={() => handleToggle(u._id, u.isActive)}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(u._id, u.name)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;

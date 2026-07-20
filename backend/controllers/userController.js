import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
  return bcrypt.hash(password, salt);
};

const validateFields = (email, password) => {
  if (!validator.isEmail(email)) return "Please enter a valid email";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
};

// ─── Regular User: Register & Login ───────────────────────────────────────────

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const validationError = validateFields(email, password);
    if (validationError) return res.json({ success: false, message: validationError });

    const hashedPassword = await hashPassword(password);
    const newUser = new userModel({ name, email, password: hashedPassword, role: "user" });
    const user = await newUser.save();

    const token = createToken(user._id);
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    if (!user.isActive) {
      return res.json({ success: false, message: "Account is deactivated. Contact admin." });
    }

    const token = createToken(user._id);
    res.json({ success: true, token, role: user.role, name: user.name });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Login failed" });
  }
};

// ─── Admin: Register Admin ─────────────────────────────────────────────────────
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.json({ success: false, message: "Name, email, and password are required" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });

    const validationError = validateFields(email, password);
    if (validationError) return res.json({ success: false, message: validationError });

    const hashedPassword = await hashPassword(password);
    const admin = await new userModel({ name, email, password: hashedPassword, role: "admin" }).save();

    res.json({ success: true, message: "Admin created successfully", admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create admin" });
  }
};

// ─── Admin: Register Restaurant ───────────────────────────────────────────────
const registerRestaurant = async (req, res) => {
  const { name, email, password, restaurantName } = req.body;
  try {
    if (!name || !email || !password || !restaurantName)
      return res.json({ success: false, message: "Name, email, password, and restaurantName are required" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });

    const validationError = validateFields(email, password);
    if (validationError) return res.json({ success: false, message: validationError });

    const hashedPassword = await hashPassword(password);
    const restaurant = await new userModel({ name, email, password: hashedPassword, role: "restaurant", restaurantName }).save();

    res.json({ success: true, message: "Restaurant account created successfully", restaurant: { id: restaurant._id, name: restaurant.name, email: restaurant.email, restaurantName: restaurant.restaurantName, role: restaurant.role } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create restaurant account" });
  }
};

// ─── Admin: Register Delivery Partner ─────────────────────────────────────────
const registerDelivery = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.json({ success: false, message: "Name, email, and password are required" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });

    const validationError = validateFields(email, password);
    if (validationError) return res.json({ success: false, message: validationError });

    const hashedPassword = await hashPassword(password);
    const deliveryUser = await new userModel({ name, email, password: hashedPassword, role: "delivery", isAvailable: true }).save();

    res.json({ success: true, message: "Delivery partner created successfully", deliveryPartner: { id: deliveryUser._id, name: deliveryUser.name, email: deliveryUser.email, role: deliveryUser.role } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create delivery partner" });
  }
};

// ─── Admin: List Users by Role ─────────────────────────────────────────────────
const listUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await userModel.find(filter).select("-password -cartData");
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch users" });
  }
};

// ─── Admin: Toggle User Active Status ─────────────────────────────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update status" });
  }
};

// ─── Admin: Delete User ────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to delete user" });
  }
};

// ─── Seed: Create First Admin (only works if NO admin exists yet) ──────────────
const seedAdmin = async (req, res) => {
  try {
    const adminExists = await userModel.findOne({ role: "admin" });
    if (adminExists)
      return res.json({ success: false, message: "An admin already exists. Login to admin panel to add more." });

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.json({ success: false, message: "Name, email and password are required" });

    const validationError = validateFields(email, password);
    if (validationError) return res.json({ success: false, message: validationError });

    const hashedPassword = await hashPassword(password);
    await new userModel({ name, email, password: hashedPassword, role: "admin" }).save();

    res.json({ success: true, message: "First admin created! You can now login to the admin panel." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Seed failed" });
  }
};

export { loginUser, registerUser, registerAdmin, registerRestaurant, registerDelivery, listUsers, toggleUserActive, deleteUser, seedAdmin };

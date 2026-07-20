import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import favoritesRouter from "./routes/favoritesRoute.js";
import client from "prom-client";
import "dotenv/config";

// app config
const app = express();
const port = process.env.PORT || 4000;

// -------------------- Prometheus --------------------

// Registry
const register = new client.Registry();

// Collect default Node.js metrics
client.collectDefaultMetrics({ register });

// Counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// Histogram
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// Middleware
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path;

    const durationSeconds = (Date.now() - start) / 1000;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      durationSeconds
    );
  });

  next();
}

// -------------------- Middlewares --------------------

app.use(metricsMiddleware); // Keep this BEFORE all routes

app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/favorites", favoritesRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
});
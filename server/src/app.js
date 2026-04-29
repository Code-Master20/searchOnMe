const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const adminRoutes = require("./routes/adminRoutes");
const assetRoutes = require("./routes/assetRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many message requests from this IP. Please try again later."
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "searchOnMe API is running." });
});

app.use("/api/messages", messageLimiter, messageRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

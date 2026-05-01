const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const adminRoutes = require("./routes/adminRoutes");
const assetRoutes = require("./routes/assetRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
  "https://searchonme.vercel.app",
  "http://localhost:3000"
]
  .flatMap((origin) => (origin || "").split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "searchOnMe API is running." });
});

app.use("/api/messages", messageRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

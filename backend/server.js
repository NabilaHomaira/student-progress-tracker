const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// import routes
const courseRoutes = require("./routes/courseRoutes");
const statsRoutes = require("./routes/statsRoutes");
const authRoutes = require("./routes/authRoutes");   // ADD THIS

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// health check
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// mount your feature routes
app.use("/api/courses", courseRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);           

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));
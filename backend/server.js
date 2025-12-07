const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const courseRoutes = require("./routes/courseRoutes");

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/student-progress-tracker";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/api/courses", courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

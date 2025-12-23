require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const statsRoutes = require("./routes/statsRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/stats", statsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });;

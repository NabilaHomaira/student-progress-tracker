require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require('./routes/authRoutes');
const statsRoutes = require("./routes/statsRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const userRoutes = require("./routes/userRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const feedbackRoutes = require('./routes/feedbackRoutes');
const gradeRoutes = require("./routes/gradeRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const focusRoutes = require("./routes/focusRoutes");
const reportRoutes = require("./routes/reportRoutes");
const badgeRoutes = require("./routes/badgeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/student", focusRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/badges", badgeRoutes);

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
  });

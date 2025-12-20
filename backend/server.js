
const express = require("express");
const cors = require("cors");

const statsRoutes = require("./routes/statsRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/stats", statsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("Backend is running...");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const courseRoutes = require("./routes/courseRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// mount your feature routes
app.use("/api/courses", courseRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));

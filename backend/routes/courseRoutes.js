
const express = require("express");
const Course = require("../models/course");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load courses" });
  }
});

module.exports = router;
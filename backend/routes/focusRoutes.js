const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const focusController = require("../controllers/focusController");

// Requirement 5 – Feature 3
router.get("/focus-areas", auth, focusController.getFocusAreas);

module.exports = router;

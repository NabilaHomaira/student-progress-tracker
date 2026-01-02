const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const gradeController = require("../controllers/gradeController");

router.post(
  "/:assignmentId/grade",
  auth,
  permit("teacher"),
  gradeController.gradeAssignment
);

router.post(
  "/:assignmentId/feedback",
  auth,
  permit("teacher"),
  gradeController.addFeedback
);

module.exports = router;

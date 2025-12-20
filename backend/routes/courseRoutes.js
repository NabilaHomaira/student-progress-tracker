// const express = require('express');
// const router = express.Router();
// const courseController = require('../controllers/courseController');

// // Create a new course
// router.post('/', courseController.createCourse);

// // Get all courses
// router.get('/', courseController.getAllCourses);

// // Get course by ID
// router.get('/:id', courseController.getCourseById);

// // Update course details
// router.put('/:id', courseController.updateCourse);

// // Archive a course
// router.patch('/:id/archive', courseController.archiveCourse);

// // Unarchive a course
// router.patch('/:id/unarchive', courseController.unarchiveCourse);

// module.exports = router;




// const express = require("express");
// const router = express.Router();

// const courseController = require("../controllers/courseController");

// // GET all courses
// router.get("/", courseController.getCourses);

// // GET course by ID
// router.get("/:id", courseController.getCourseById);

// // CREATE a new course
// router.post("/", courseController.createCourse);

// // UPDATE a course
// router.put("/:id", courseController.updateCourse);

// // TOGGLE archive / unarchive
// router.patch("/:id/archive", courseController.toggleArchiveCourse);

// // DELETE a course
// router.delete("/:id", courseController.deleteCourse);

// module.exports = router;






const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
console.log("courseController keys:", Object.keys(courseController));

router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.patch("/:id/archive", courseController.toggleArchiveCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
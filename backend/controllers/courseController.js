
const Course = require("../models/Course");

// Helper: build correct filter based on your DB field "archived"
function buildArchiveFilter(showArchived) {
  // showArchived=true => show everything
  // showArchived=false => hide archived courses
  return showArchived ? {} : { archived: { $ne: true } };
}

async function getCourses(req, res) {
  try {
    console.log("✅ getCourses HIT");

    const showArchived = String(req.query.showArchived).toLowerCase() === "true";
    const filter = buildArchiveFilter(showArchived);

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Add seat availability fields for UI
    const coursesWithSeats = courses.map((c) => {
      const enrolledCount = Array.isArray(c.enrolledStudents)
        ? c.enrolledStudents.length
        : 0;

      const capacity = typeof c.capacity === "number" ? c.capacity : 0;

      return {
        ...c,
        enrolledCount,
        seatsAvailable: Math.max(capacity - enrolledCount, 0),
      };
    });

    return res.status(200).json(coursesWithSeats);
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    return res.status(500).json({
      message: "Error retrieving courses",
      error: error?.message || String(error),
    });
  }
}

async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id).lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrolledCount = Array.isArray(course.enrolledStudents)
      ? course.enrolledStudents.length
      : 0;

    const capacity = typeof course.capacity === "number" ? course.capacity : 0;

    return res.status(200).json({
      ...course,
      enrolledCount,
      seatsAvailable: Math.max(capacity - enrolledCount, 0),
    });
  } catch (error) {
    console.error("GET COURSE BY ID ERROR:", error);
    return res.status(500).json({
      message: "Error retrieving course",
      error: error?.message || String(error),
    });
  }
}

async function createCourse(req, res) {
  try {
    const { title, code, description, instructor, capacity } = req.body;

    if (!title || !code || !instructor) {
      return res.status(400).json({
        message: "Missing required fields: title, code, instructor",
      });
    }

    const newCourse = new Course({
      title: String(title).trim(),
      code: String(code).trim(),
      description: description ? String(description).trim() : "",
      instructor, // must be ObjectId (see Course.js)
      capacity: typeof capacity === "number" ? capacity : 30,
      archived: false,
      archiveDate: null,
      enrolledStudents: [],
      assistantIds: [],
    });

    const savedCourse = await newCourse.save();
    return res.status(201).json({
      message: "Course created successfully",
      course: savedCourse,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);

    if (error && error.code === 11000) {
      return res.status(400).json({
        message: "Course code already exists",
        error: error?.message || String(error),
      });
    }

    return res.status(500).json({
      message: "Error creating course",
      error: error?.message || String(error),
    });
  }
}

async function updateCourse(req, res) {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({
      message: "Course updated successfully",
      course: updated,
    });
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);

    if (error && error.code === 11000) {
      return res.status(400).json({
        message: "Course code already exists",
        error: error?.message || String(error),
      });
    }

    return res.status(500).json({
      message: "Error updating course",
      error: error?.message || String(error),
    });
  }
}

async function toggleArchiveCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // IMPORTANT: toggle "archived" (not isArchived)
    course.archived = !course.archived;
    course.archiveDate = course.archived ? new Date() : null;

    const saved = await course.save();

    return res.status(200).json({
      message: course.archived ? "Course archived" : "Course unarchived",
      course: saved,
    });
  } catch (error) {
    console.error("TOGGLE ARCHIVE COURSE ERROR:", error);
    return res.status(500).json({
      message: "Error archiving/unarchiving course",
      error: error?.message || String(error),
    });
  }
}

async function deleteCourse(req, res) {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return res.status(500).json({
      message: "Error deleting course",
      error: error?.message || String(error),
    });
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  toggleArchiveCourse,
  deleteCourse,
};
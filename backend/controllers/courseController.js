const Course = require('../models/Course');

// Archive a course
exports.archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already archived
    if (course.isArchived) {
      return res
        .status(400)
        .json({ message: 'Course is already archived' });
    }

    // Archive the course
    const archivedCourse = await Course.findByIdAndUpdate(
      id,
      {
        isArchived: true,
        archiveDate: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Course archived successfully',
      course: archivedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving course', error });
  }
};

// Unarchive a course
exports.unarchiveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already active
    if (!course.isArchived) {
      return res
        .status(400)
        .json({ message: 'Course is already active' });
    }

    // Unarchive the course
    const unarchivedCourse = await Course.findByIdAndUpdate(
      id,
      {
        isArchived: false,
        archiveDate: null,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Course reactivated successfully',
      course: unarchivedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reactivating course', error });
  }
};

// Get all courses (with option to filter archived)
exports.getAllCourses = async (req, res) => {
  try {
    const { includeArchived } = req.query;

    let query = {};
    if (includeArchived === 'false') {
      query.isArchived = false;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email');

    res.status(200).json({
      message: 'Courses retrieved successfully',
      courses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving courses', error });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      message: 'Course retrieved successfully',
      course,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving course', error });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, code, description, instructor } = req.body;

    // Validate required fields
    if (!title || !code || !description || !instructor) {
      return res
        .status(400)
        .json({ message: 'All fields are required' });
    }

    const newCourse = new Course({
      title,
      code,
      description,
      instructor,
      isArchived: false,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: savedCourse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Error creating course', error });
  }
};

// Update course details
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, description } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title: title || course.title,
        code: code || course.code,
        description: description || course.description,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Error updating course', error });
  }
};

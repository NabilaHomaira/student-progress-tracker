/**
 * Report Service - Handles CSV and PDF report generation
 * Modular service for grade report exports without affecting existing features
 */

const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const User = require('../models/User');
const Student = require('../models/student');
const Assignment = require('../models/Assignment');

/**
 * Generate Per Student Report Data
 * Returns structured data for a specific student across all courses
 */
const generatePerStudentReportData = async (studentId) => {
  try {
    // Attempt to resolve the student as a User first
    let user = await User.findById(studentId).select('name email');

    // Try to find the Student enrollment document in several ways:
    // 1) by matching User email, 2) by Student._id (studentId may actually be a Student id)
    // This makes the report API accept either User id or Student id.
    let studentEnrollment = null;
    if (user && user.email) {
      studentEnrollment = await Student.findOne({ email: user.email }).populate({
        path: 'enrollments.course',
        select: 'title code instructor',
      });
    }

    if (!studentEnrollment) {
      // try as Student._id
      studentEnrollment = await Student.findById(studentId).populate({
        path: 'enrollments.course',
        select: 'title code instructor',
      });
      if (studentEnrollment && !user) {
        // try to resolve a linked User by email stored on Student
        user = await User.findOne({ email: studentEnrollment.email }).select('name email');
      }
    }

    if (!studentEnrollment || !studentEnrollment.enrollments?.length) {
      throw new Error('No enrollment records found for this student');
    }

    const enrolledCourses = studentEnrollment.enrollments.map((e) => e.course);

    // Get all assignments and submissions for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: enrolledCourses.map((c) => c._id) },
    }).select('title course maxScore');

    if (!assignments.length) {
      throw new Error('No assignments found for this student');
    }

    // Get submissions. Note: AssignmentSubmission uses `assignment` and `student` fields
    const submissions = await AssignmentSubmission.find({
      student: user ? user._id : null,
      assignment: { $in: assignments.map((a) => a._id) },
    }).populate('assignment', 'title maxScore course');

    const reportData = {
      studentName: (user && user.name) || studentEnrollment.name,
      studentId,
      email: (user && user.email) || studentEnrollment.email,
      generatedAt: new Date().toLocaleDateString(),
      courses: [],
    };

    // Organize data by course
    enrolledCourses.forEach((course) => {
      const courseAssignments = assignments.filter((a) => a.course.equals(course._id));
      const courseSubmissions = submissions.filter((s) =>
        courseAssignments.some((a) => a._id.equals(s.assignment._id))
      );

      if (courseAssignments.length > 0) {
        const courseData = {
          courseName: course.title,
          courseCode: course.code,
          assignments: courseAssignments.map(assignment => {
            const submission = courseSubmissions.find((s) =>
              s.assignment._id.equals(assignment._id)
            );
            return {
              assignmentTitle: assignment.title,
              scoreObtained: submission ? submission.score : 0,
              maxScore: assignment.maxScore,
              submitted: !!submission,
            };
          }),
        };

        // Calculate totals
        const totalScores = courseData.assignments.reduce((sum, a) => sum + a.scoreObtained, 0);
        const totalMaxScores = courseData.assignments.reduce((sum, a) => sum + a.maxScore, 0);
        courseData.totalScore = totalScores;
        courseData.maxTotalScore = totalMaxScores;
        courseData.average = totalMaxScores > 0 ? ((totalScores / totalMaxScores) * 100).toFixed(2) : 0;

        reportData.courses.push(courseData);
      }
    });

    if (!reportData.courses.length) {
      throw new Error('No grade data available for this student');
    }

    return reportData;
  } catch (error) {
    throw new Error(`Error generating student report: ${error.message}`);
  }
};

/**
 * Generate Per Course Report Data
 * Returns structured data for all students in a specific course
 */
const generatePerCourseReportData = async (courseId) => {
  try {
    // Get course details with populated enrolledStudents
    const course = await Course.findById(courseId)
      .populate('instructor', 'name')
      .populate('enrolledStudents', '_id name email')
      .select('title code instructor enrolledStudents');

    if (!course) {
      throw new Error('Course not found');
    }

    // Extract student IDs from populated enrolledStudents
    let studentIds = Array.isArray(course.enrolledStudents) 
      ? course.enrolledStudents.map(s => s._id || s) 
      : [];

    // Fallback: find Student docs that list this course
    if (!studentIds.length) {
      const studentEnrollments = await Student.find({ 'enrollments.course': courseId }).select('email');
      if (!studentEnrollments.length) {
        throw new Error('No students enrolled in this course');
      }
      // map emails to User ids
      const emails = studentEnrollments.map(se => se.email).filter(Boolean);
      const users = await User.find({ email: { $in: emails } }).select('_id');
      studentIds = users.map(u => u._id);
    }

    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId })
      .select('title maxScore');

    if (!assignments.length) {
      throw new Error('No assignments found for this course');
    }

    // Get all submissions (AssignmentSubmission uses `student` and `assignment`)
    const submissions = await AssignmentSubmission.find({
      student: { $in: studentIds },
      assignment: { $in: assignments.map(a => a._id) },
    }).populate('student', 'name');

    // Get student details
    const students = await User.find({ _id: { $in: studentIds } })
      .select('name _id');

    const reportData = {
      courseName: course.title,
      courseCode: course.code,
      instructor: course.instructor ? course.instructor.name : '',
      generatedAt: new Date().toLocaleDateString(),
      students: [],
      classAverage: 0,
    };

    // Organize data by student
    let totalClassScore = 0;
    let totalClassMaxScore = 0;

    students.forEach(student => {
      const studentData = {
        studentName: student.name,
        studentId: student._id,
        assignments: assignments.map(assignment => {
          const submission = submissions.find(s =>
            s.student._id.equals(student._id) && s.assignment.equals(assignment._id)
          );
          return {
            assignmentTitle: assignment.title,
            scoreObtained: submission ? submission.score : 0,
            maxScore: assignment.maxScore,
            submitted: !!submission,
          };
        }),
      };

      // Calculate student totals
      const totalScore = studentData.assignments.reduce((sum, a) => sum + a.scoreObtained, 0);
      const totalMaxScore = studentData.assignments.reduce((sum, a) => sum + a.maxScore, 0);

      studentData.totalScore = totalScore;
      studentData.maxTotalScore = totalMaxScore;
      studentData.average = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;

      totalClassScore += totalScore;
      totalClassMaxScore += totalMaxScore;

      reportData.students.push(studentData);
    });

    // Calculate class average
    reportData.classAverage = totalClassMaxScore > 0 
      ? ((totalClassScore / (totalClassMaxScore)) * 100).toFixed(2) 
      : 0;

    return reportData;
  } catch (error) {
    throw new Error(`Error generating course report: ${error.message}`);
  }
};

/**
 * Convert report data to CSV format
 */
const generateCSV = (reportData, reportType) => {
  let csv = '';

  if (reportType === 'student') {
    csv += `Student Report\n`;
    csv += `Name,ID,Email,Generated Date\n`;
    csv += `"${reportData.studentName}","${reportData.studentId}","${reportData.email}","${reportData.generatedAt}"\n\n`;

    reportData.courses.forEach(course => {
      csv += `Course: ${course.courseName} (${course.courseCode})\n`;
      csv += `Assignment Title,Score Obtained,Max Score,Submitted\n`;
      course.assignments.forEach(assignment => {
        csv += `"${assignment.assignmentTitle}",${assignment.scoreObtained},${assignment.maxScore},"${assignment.submitted ? 'Yes' : 'No'}"\n`;
      });
      csv += `Total,${course.totalScore},${course.maxTotalScore},\n`;
      csv += `Average,${course.average}%,,\n\n`;
    });
  } else if (reportType === 'course') {
    csv += `Course Report\n`;
    csv += `Course Name,Code,Instructor,Generated Date\n`;
    csv += `"${reportData.courseName}","${reportData.courseCode}","${reportData.instructor}","${reportData.generatedAt}"\n\n`;

    csv += `Student Name,Student ID`;
    reportData.students[0].assignments.forEach(assignment => {
      csv += `,"${assignment.assignmentTitle}"`;
    });
    csv += `,Total Score,Average\n`;

    reportData.students.forEach(student => {
      csv += `"${student.studentName}","${student.studentId}"`;
      student.assignments.forEach(assignment => {
        csv += `,${assignment.scoreObtained}`;
      });
      csv += `,${student.totalScore},${student.average}%\n`;
    });

    csv += `\nClass Average,${reportData.classAverage}%\n`;
  }

  return csv;
};

/**
 * Convert report data to PDF format (simple text-based layout)
 * Returns PDF-ready content that can be rendered
 */
const generatePDFContent = (reportData, reportType, teacherName) => {
  let content = '';

  if (reportType === 'student') {
    content += `STUDENT GRADE REPORT\n`;
    content += `${'='.repeat(80)}\n\n`;
    content += `Student Name: ${reportData.studentName}\n`;
    content += `Student ID: ${reportData.studentId}\n`;
    content += `Email: ${reportData.email}\n`;
    content += `Generated Date: ${reportData.generatedAt}\n`;
    content += `Generated By: ${teacherName}\n`;
    content += `${'='.repeat(80)}\n\n`;

    reportData.courses.forEach(course => {
      content += `Course: ${course.courseName} (${course.courseCode})\n`;
      content += `${'-'.repeat(80)}\n`;
      content += `${String('Assignment').padEnd(35)} | ${'Score'.padEnd(10)} | ${'Max'.padEnd(10)} | ${'Status'.padEnd(10)}\n`;
      content += `${'-'.repeat(80)}\n`;

      course.assignments.forEach(assignment => {
        content += `${String(assignment.assignmentTitle).substring(0, 34).padEnd(35)} | ${String(assignment.scoreObtained).padEnd(10)} | ${String(assignment.maxScore).padEnd(10)} | ${String(assignment.submitted ? 'Submitted' : 'Pending').padEnd(10)}\n`;
      });

      content += `${'-'.repeat(80)}\n`;
      content += `Total Score: ${course.totalScore}/${course.maxTotalScore}\n`;
      content += `Average: ${course.average}%\n`;
      content += `\n`;
    });
  } else if (reportType === 'course') {
    content += `COURSE GRADE REPORT\n`;
    content += `${'='.repeat(100)}\n\n`;
    content += `Course: ${reportData.courseName} (${reportData.courseCode})\n`;
    content += `Instructor: ${reportData.instructor}\n`;
    content += `Generated Date: ${reportData.generatedAt}\n`;
    content += `Generated By: ${teacherName}\n`;
    content += `${'='.repeat(100)}\n\n`;

    content += `Student: ${String('').padEnd(20)}`;
    reportData.students[0].assignments.forEach(assignment => {
      content += ` | ${String(assignment.assignmentTitle).substring(0, 12).padEnd(12)}`;
    });
    content += ` | ${'Total'.padEnd(8)} | ${'Average'.padEnd(8)}\n`;
    content += `${'-'.repeat(100)}\n`;

    reportData.students.forEach(student => {
      content += `${String(student.studentName).substring(0, 20).padEnd(20)}`;
      student.assignments.forEach(assignment => {
        content += ` | ${String(assignment.scoreObtained).padEnd(12)}`;
      });
      content += ` | ${String(student.totalScore).padEnd(8)} | ${String(student.average + '%').padEnd(8)}\n`;
    });

    content += `${'-'.repeat(100)}\n`;
    content += `Class Average: ${reportData.classAverage}%\n`;
  }

  return content;
};

module.exports = {
  generatePerStudentReportData,
  generatePerCourseReportData,
  generateCSV,
  generatePDFContent,
};

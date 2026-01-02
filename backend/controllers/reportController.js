/**
 * Report Controller - Handles grade report generation and download
 * Modular controller for CSV and PDF report exports
 */

const reportService = require('../services/reportService');
const User = require('../models/User');

/**
 * Generate and download per-student report
 * GET /api/reports/student/:studentId/format/:format
 */
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const format = (req.params.format || req.query.format || '').toLowerCase();
    if (!format) {
      return res.status(400).json({ message: 'Missing format. Provide format as /format/:format or ?format=csv|pdf' });
    }
    const teacherId = req.userId;

    // Validate format
    if (!['csv', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid format. Use csv or pdf.' });
    }

    // Get report data
    const reportData = await reportService.generatePerStudentReportData(studentId);

    if (format === 'csv') {
      // Generate CSV
      const csv = reportService.generateCSV(reportData, 'student');

      // Send CSV file
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="student_report_${studentId}_${Date.now()}.csv"`);
      res.send(csv);
    } else if (format === 'pdf') {
      // Generate PDF content
      const teacher = await User.findById(teacherId).select('firstName lastName');
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      const pdfContent = reportService.generatePDFContent(reportData, 'student', teacherName);

      // Send as text file with PDF-ready content
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="student_report_${studentId}_${Date.now()}.txt"`);
      res.send(pdfContent);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate and download per-course report
 * GET /api/reports/course/:courseId/format/:format
 */
exports.generateCourseReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const format = (req.params.format || req.query.format || '').toLowerCase();
    if (!format) {
      return res.status(400).json({ message: 'Missing format. Provide format as /format/:format or ?format=csv|pdf' });
    }
    const teacherId = req.userId;

    // Validate format
    if (!['csv', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid format. Use csv or pdf.' });
    }

    // Get report data
    const reportData = await reportService.generatePerCourseReportData(courseId);

    if (format === 'csv') {
      // Generate CSV
      const csv = reportService.generateCSV(reportData, 'course');

      // Send CSV file
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="course_report_${courseId}_${Date.now()}.csv"`);
      res.send(csv);
    } else if (format === 'pdf') {
      // Generate PDF content
      const teacher = await User.findById(teacherId).select('firstName lastName');
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      const pdfContent = reportService.generatePDFContent(reportData, 'course', teacherName);

      // Send as text file with PDF-ready content
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="course_report_${courseId}_${Date.now()}.txt"`);
      res.send(pdfContent);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Validate if grade data exists for student
 * GET /api/reports/student/:studentId/validate
 */
exports.validateStudentGradeData = async (req, res) => {
  try {
    const { studentId } = req.params;

    const reportData = await reportService.generatePerStudentReportData(studentId);
    
    res.status(200).json({
      hasData: !!reportData && reportData.courses.length > 0,
      message: reportData.courses.length > 0 ? 'Grade data available' : 'No grade data found',
      courseCount: reportData.courses.length,
    });
  } catch (error) {
    res.status(200).json({
      hasData: false,
      message: error.message,
      courseCount: 0,
    });
  }
};

/**
 * Validate if grade data exists for course
 * GET /api/reports/course/:courseId/validate
 */
exports.validateCourseGradeData = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reportData = await reportService.generatePerCourseReportData(courseId);

    res.status(200).json({
      hasData: !!reportData && reportData.students.length > 0,
      message: reportData.students.length > 0 ? 'Grade data available' : 'No students enrolled',
      studentCount: reportData.students.length,
    });
  } catch (error) {
    res.status(200).json({
      hasData: false,
      message: error.message,
      studentCount: 0,
    });
  }
};

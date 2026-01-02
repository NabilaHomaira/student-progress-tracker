/**
 * Achievement Badge Service
 * Calculates and retrieves achievement badges based on existing performance data
 * Modular, read-only service that doesn't affect existing features
 */

const badgeDefinitions = require('../config/badgeDefinitions');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const Student = require('../models/student');
const Assignment = require('../models/Assignment');

/**
 * Check if student qualifies for High Performer badge
 * Criteria: Average score >= 85%
 */
const checkHighPerformer = async (studentId, courseId) => {
  try {
    // Get all assignments for the course
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    // Get all submissions for this student in this course
    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    }).populate('assignmentId', 'maxScore');

    if (!submissions.length) return false;

    // Calculate average score
    let totalScore = 0;
    let totalMaxScore = 0;

    submissions.forEach(sub => {
      totalScore += sub.score || 0;
      totalMaxScore += sub.assignmentId.maxScore || 0;
    });

    if (totalMaxScore === 0) return false;

    const average = (totalScore / totalMaxScore) * 100;
    return average >= 85;
  } catch (error) {
    console.error('Error checking High Performer badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Consistent Learner badge
 * Criteria: 100% of assignments submitted on time
 */
const checkConsistentLearner = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    }).populate('assignmentId', 'dueDate');

    if (submissions.length !== assignments.length) return false; // Not all assignments submitted

    // Check if all submitted on time
    const allOnTime = submissions.every(sub => {
      const dueDate = new Date(sub.assignmentId.dueDate);
      const submissionDate = new Date(sub.createdAt || sub.updatedAt);
      return submissionDate <= dueDate;
    });

    return allOnTime;
  } catch (error) {
    console.error('Error checking Consistent Learner badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Top Scorer badge
 * Criteria: Highest overall score in the course
 */
const checkTopScorer = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    // Get all submissions for this course
    const allSubmissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignments.map(a => a._id) },
    }).populate('assignmentId', 'maxScore studentId');

    if (!allSubmissions.length) return false;

    // Calculate totals for each student
    const studentTotals = {};
    allSubmissions.forEach(sub => {
      const sId = String(sub.studentId);
      if (!studentTotals[sId]) {
        studentTotals[sId] = { score: 0, maxScore: 0 };
      }
      studentTotals[sId].score += sub.score || 0;
      studentTotals[sId].maxScore += sub.assignmentId.maxScore || 0;
    });

    // Find highest average
    let highestAverage = 0;
    let topStudentId = null;

    Object.entries(studentTotals).forEach(([sId, totals]) => {
      if (totals.maxScore > 0) {
        const avg = (totals.score / totals.maxScore) * 100;
        if (avg > highestAverage) {
          highestAverage = avg;
          topStudentId = sId;
        }
      }
    });

    return String(studentId) === topStudentId && highestAverage > 0;
  } catch (error) {
    console.error('Error checking Top Scorer badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Improved Performance badge
 * Criteria: At least 10% improvement across assessments
 */
const checkImprovedPerformance = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId }).sort('createdAt');
    if (assignments.length < 2) return false; // Need at least 2 assignments

    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    })
      .populate('assignmentId', 'maxScore createdAt')
      .sort({ createdAt: 1 });

    if (submissions.length < 2) return false;

    // Get first and last assignment scores
    const firstSubmission = submissions[0];
    const lastSubmission = submissions[submissions.length - 1];

    if (!firstSubmission || !lastSubmission) return false;

    const firstScore = (firstSubmission.score / firstSubmission.assignmentId.maxScore) * 100;
    const lastScore = (lastSubmission.score / lastSubmission.assignmentId.maxScore) * 100;

    const improvement = lastScore - firstScore;
    return improvement >= 10; // At least 10% improvement
  } catch (error) {
    console.error('Error checking Improved Performance badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Course Completion badge
 * Criteria: All assignments in course are completed
 */
const checkCourseCompletion = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    });

    // All assignments must be submitted
    return submissions.length === assignments.length;
  } catch (error) {
    console.error('Error checking Course Completion badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Perfect Score badge
 * Criteria: At least one assignment with 100%
 */
const checkPerfectScore = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    }).populate('assignmentId', 'maxScore');

    // Check if any submission has perfect score
    return submissions.some(sub => {
      const percentage = (sub.score / sub.assignmentId.maxScore) * 100;
      return percentage === 100;
    });
  } catch (error) {
    console.error('Error checking Perfect Score badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Engaged Learner badge
 * Criteria: Enrolled in 3+ courses
 */
const checkEngagedLearner = async (studentId) => {
  try {
    const studentEnrollment = await Student.findOne({ userId: studentId });
    if (!studentEnrollment) return false;

    // Count active enrollments (not dropped)
    const activeEnrollments = studentEnrollment.enrollments.filter(
      e => e.status !== 'dropped'
    );

    return activeEnrollments.length >= 3;
  } catch (error) {
    console.error('Error checking Engaged Learner badge:', error);
    return false;
  }
};

/**
 * Check if student qualifies for Quick Submitter badge
 * Criteria: Submitted 80% of assignments at least 3 days early
 */
const checkQuickSubmitter = async (studentId, courseId) => {
  try {
    const assignments = await Assignment.find({ courseId });
    if (!assignments.length) return false;

    const submissions = await AssignmentSubmission.find({
      studentId,
      assignmentId: { $in: assignments.map(a => a._id) },
    }).populate('assignmentId', 'dueDate');

    if (!submissions.length) return false;

    // Count early submissions (3+ days before due date)
    const earlySubmissions = submissions.filter(sub => {
      const dueDate = new Date(sub.assignmentId.dueDate);
      const submissionDate = new Date(sub.createdAt || sub.updatedAt);
      const daysDiff = (dueDate - submissionDate) / (1000 * 60 * 60 * 24);
      return daysDiff >= 3;
    });

    const earlyPercentage = (earlySubmissions.length / submissions.length) * 100;
    return earlyPercentage >= 80;
  } catch (error) {
    console.error('Error checking Quick Submitter badge:', error);
    return false;
  }
};

/**
 * Calculate all badges for a student in a specific course
 */
const calculateBadgesForStudentCourse = async (studentId, courseId) => {
  try {
    const badgeChecks = {
      high_performer: () => checkHighPerformer(studentId, courseId),
      consistent_learner: () => checkConsistentLearner(studentId, courseId),
      top_scorer: () => checkTopScorer(studentId, courseId),
      improved_performance: () => checkImprovedPerformance(studentId, courseId),
      course_completion: () => checkCourseCompletion(studentId, courseId),
      perfect_score: () => checkPerfectScore(studentId, courseId),
      quick_submitter: () => checkQuickSubmitter(studentId, courseId),
    };

    const earnedBadges = [];

    // Check each badge
    for (const [badgeId, checkFn] of Object.entries(badgeChecks)) {
      try {
        const qualified = await checkFn();
        if (qualified) {
          const badgeDef = badgeDefinitions.getBadgeById(badgeId);
          if (badgeDef) {
            earnedBadges.push({
              id: badgeId,
              name: badgeDef.name,
              description: badgeDef.description,
              icon: badgeDef.icon,
              color: badgeDef.color,
              earnedAt: new Date(),
            });
          }
        }
      } catch (err) {
        console.error(`Error checking badge ${badgeId}:`, err);
      }
    }

    return earnedBadges;
  } catch (error) {
    console.error('Error calculating badges:', error);
    return [];
  }
};

/**
 * Calculate all badges for a student across all courses
 */
const calculateBadgesForStudent = async (studentId) => {
  try {
    // Get student enrollments
    const studentEnrollment = await Student.findOne({ userId: studentId });
    if (!studentEnrollment || !studentEnrollment.enrollments.length) {
      return [];
    }

    // Check student-level badges
    const allBadges = [];
    const engagedBadge = await checkEngagedLearner(studentId);
    if (engagedBadge) {
      const badgeDef = badgeDefinitions.getBadgeById('engaged_learner');
      allBadges.push({
        id: 'engaged_learner',
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        color: badgeDef.color,
        scope: 'student',
        earnedAt: new Date(),
      });
    }

    // Check course-level badges for each course
    const courseBadges = {};
    for (const enrollment of studentEnrollment.enrollments) {
      const courseId = enrollment.courseId;
      const badges = await calculateBadgesForStudentCourse(studentId, courseId);
      if (badges.length > 0) {
        courseBadges[String(courseId)] = badges;
      }
    }

    return {
      studentBadges: allBadges,
      courseBadges: courseBadges,
    };
  } catch (error) {
    console.error('Error calculating student badges:', error);
    return { studentBadges: [], courseBadges: {} };
  }
};

/**
 * Get student badges for a specific course
 */
const getBadgesForStudentCourse = async (studentId, courseId) => {
  try {
    return await calculateBadgesForStudentCourse(studentId, courseId);
  } catch (error) {
    console.error('Error getting course badges:', error);
    return [];
  }
};

module.exports = {
  calculateBadgesForStudent,
  calculateBadgesForStudentCourse,
  getBadgesForStudentCourse,
  checkHighPerformer,
  checkConsistentLearner,
  checkTopScorer,
  checkImprovedPerformance,
  checkCourseCompletion,
  checkPerfectScore,
  checkEngagedLearner,
  checkQuickSubmitter,
};

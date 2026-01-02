/**
 * Badge Definitions Configuration
 * Static configuration for all available achievement badges
 * Modular and easy to extend with new badge types
 */

const BADGE_DEFINITIONS = {
  HIGH_PERFORMER: {
    id: 'high_performer',
    name: 'High Performer',
    description: 'Achieved average score of 85% or higher',
    icon: '⭐',
    color: '#FFD700', // Gold
    criteria: {
      type: 'average_score',
      threshold: 85,
    },
    scope: 'course', // Applied per course
  },

  CONSISTENT_LEARNER: {
    id: 'consistent_learner',
    name: 'Consistent Learner',
    description: 'Submitted all assignments on time',
    icon: '📅',
    color: '#4CAF50', // Green
    criteria: {
      type: 'on_time_submissions',
      percentage: 100, // All assignments on time
    },
    scope: 'course',
  },

  TOP_SCORER: {
    id: 'top_scorer',
    name: 'Top Scorer',
    description: 'Highest overall score in the course',
    icon: '🏆',
    color: '#FF6B6B', // Red
    criteria: {
      type: 'highest_score',
      rank: 1, // Rank 1 in course
    },
    scope: 'course',
  },

  IMPROVED_PERFORMANCE: {
    id: 'improved_performance',
    name: 'Improved Performance',
    description: 'Showed significant improvement across assessments',
    icon: '📈',
    color: '#2196F3', // Blue
    criteria: {
      type: 'grade_improvement',
      improvement_threshold: 10, // At least 10% improvement
    },
    scope: 'course',
  },

  COURSE_COMPLETION: {
    id: 'course_completion',
    name: 'Course Completion',
    description: 'Completed all assignments in the course',
    icon: '✅',
    color: '#9C27B0', // Purple
    criteria: {
      type: 'all_assignments_completed',
      percentage: 100,
    },
    scope: 'course',
  },

  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieved 100% on an assignment',
    icon: '💯',
    color: '#FF9800', // Orange
    criteria: {
      type: 'perfect_assignment',
      score: 100,
    },
    scope: 'course',
  },

  ENGAGED_LEARNER: {
    id: 'engaged_learner',
    name: 'Engaged Learner',
    description: 'Active across multiple courses',
    icon: '🚀',
    color: '#00BCD4', // Cyan
    criteria: {
      type: 'multi_course_enrollment',
      min_courses: 3,
    },
    scope: 'student', // Applied to student overall
  },

  QUICK_SUBMITTER: {
    id: 'quick_submitter',
    name: 'Quick Submitter',
    description: 'Submitted assignments well before deadline',
    icon: '⚡',
    color: '#FFEB3B', // Yellow
    criteria: {
      type: 'early_submission',
      days_early: 3, // At least 3 days before deadline
      percentage: 80, // 80% of assignments
    },
    scope: 'course',
  },
};

/**
 * Badge categories for filtering and display
 */
const BADGE_CATEGORIES = {
  ACADEMIC: ['high_performer', 'top_scorer', 'perfect_score'],
  CONSISTENCY: ['consistent_learner', 'quick_submitter'],
  GROWTH: ['improved_performance'],
  COMPLETION: ['course_completion'],
  ENGAGEMENT: ['engaged_learner'],
};

/**
 * Get all badge definitions
 */
const getAllBadges = () => Object.values(BADGE_DEFINITIONS);

/**
 * Get badge by ID
 */
const getBadgeById = (badgeId) => BADGE_DEFINITIONS[badgeId.toUpperCase()];

/**
 * Get badges by category
 */
const getBadgesByCategory = (category) => {
  const badgeIds = BADGE_CATEGORIES[category.toUpperCase()] || [];
  return badgeIds
    .map(id => {
      const key = Object.keys(BADGE_DEFINITIONS).find(
        k => BADGE_DEFINITIONS[k].id === id
      );
      return BADGE_DEFINITIONS[key];
    })
    .filter(badge => badge);
};

/**
 * Get badge display info (icon, color, name)
 */
const getBadgeDisplay = (badgeId) => {
  const badge = getBadgeById(badgeId);
  return badge
    ? {
        icon: badge.icon,
        name: badge.name,
        description: badge.description,
        color: badge.color,
      }
    : null;
};

module.exports = {
  BADGE_DEFINITIONS,
  BADGE_CATEGORIES,
  getAllBadges,
  getBadgeById,
  getBadgesByCategory,
  getBadgeDisplay,
};

import React from 'react';
import '../styles/CourseCard.css';

const CourseCard = ({ course, onArchive, onUnarchive }) => {
  const handleArchiveClick = () => {
    onArchive(course._id);
  };

  const handleUnarchiveClick = () => {
    onUnarchive(course._id);
  };

  return (
    <div className={`course-card ${course.isArchived ? 'archived' : ''}`}>
      <div className="course-header">
        <div className="course-info">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-code">{course.code}</p>
        </div>
        {course.isArchived && (
          <span className="archive-badge">Archived</span>
        )}
      </div>

      <p className="course-description">{course.description}</p>

      <div className="course-meta">
        <span className="enrolled-count">
          {course.enrolledStudents?.length || 0} students enrolled
        </span>
        {course.archiveDate && (
          <span className="archive-date">
            Archived: {new Date(course.archiveDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="course-actions">
        {!course.isArchived ? (
          <button
            className="btn btn-archive"
            onClick={handleArchiveClick}
            title="Archive this course to preserve records"
          >
            Archive Course
          </button>
        ) : (
          <button
            className="btn btn-unarchive"
            onClick={handleUnarchiveClick}
            title="Reactivate this archived course"
          >
            Reactivate Course
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;

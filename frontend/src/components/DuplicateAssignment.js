import React, { useState, useEffect } from 'react';
import '../styles/DuplicateAssignment.css';

const DuplicateAssignment = ({ assignmentId, assignmentTitle, onClose, onSuccess }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [adjustDueDate, setAdjustDueDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getAllCourses } = await import('../services/courseService');
      const response = await getAllCourses();
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleDuplicate = async () => {
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    setDuplicating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { duplicateAssignment } = await import('../services/assignmentService');
      const response = await duplicateAssignment(assignmentId, selectedCourses, adjustDueDate);
      const data = response.data || response;
      setSuccessMessage(
        `✅ Assignment duplicated successfully to ${data.duplicatedCount || data.count || selectedCourses.length} course(s)`
      );

      // Clear selections
      setSelectedCourses([]);
      setAdjustDueDate(false);

      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        }
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error('Error duplicating assignment:', err);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <div className="duplicate-assignment-modal">
        <div className="modal-content">
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="duplicate-assignment-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Duplicate Assignment</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="assignment-info">
            <p className="info-label">Duplicating:</p>
            <p className="assignment-title">{assignmentTitle}</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="options-section">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={adjustDueDate}
                onChange={(e) => setAdjustDueDate(e.target.checked)}
                disabled={duplicating}
              />
              <span>Adjust due date (+7 days for each course)</span>
            </label>
          </div>

          <div className="courses-section">
            <label className="section-label">Select target courses:</label>
            {courses.length > 0 ? (
              <div className="courses-list">
                {courses.map((course) => (
                  <label key={course._id} className="course-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => handleCourseToggle(course._id)}
                      disabled={duplicating}
                    />
                    <div className="course-info">
                      <span className="course-title">{course.title}</span>
                      <span className="course-code">{course.code}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="no-courses">No courses available</p>
            )}
          </div>

          <div className="selection-count">
            {selectedCourses.length > 0 && (
              <p>
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''}{' '}
                selected
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-cancel"
            onClick={onClose}
            disabled={duplicating}
          >
            Cancel
          </button>
          <button
            className="btn btn-duplicate"
            onClick={handleDuplicate}
            disabled={duplicating || selectedCourses.length === 0}
          >
            {duplicating ? 'Duplicating...' : 'Duplicate to Selected Courses'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateAssignment;

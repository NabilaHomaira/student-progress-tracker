import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import '../styles/CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCourses();
  }, [showArchived]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const includeArchived = showArchived ? 'true' : 'false';
      const response = await fetch(
        `${API_BASE_URL}/api/courses?includeArchived=${includeArchived}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveCourse = async (courseId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/courses/${courseId}/archive`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive course');
      }

      const data = await response.json();
      console.log('Course archived:', data.message);
      fetchCourses();
    } catch (err) {
      setError(err.message);
      console.error('Error archiving course:', err);
    }
  };

  const handleUnarchiveCourse = async (courseId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/courses/${courseId}/unarchive`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unarchive course');
      }

      const data = await response.json();
      console.log('Course unarchived:', data.message);
      fetchCourses();
    } catch (err) {
      setError(err.message);
      console.error('Error unarchiving course:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h2>Courses</h2>
        <div className="filter-controls">
          <label className="filter-label">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show Archived Courses
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="course-list">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onArchive={handleArchiveCourse}
              onUnarchive={handleUnarchiveCourse}
            />
          ))
        ) : (
          <div className="no-courses">
            {showArchived
              ? 'No archived courses found.'
              : 'No active courses found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;

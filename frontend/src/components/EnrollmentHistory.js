import React, { useState, useEffect } from 'react';
import '../styles/EnrollmentHistory.css';

const EnrollmentHistory = () => {
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, enrolled, dropped, completed

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchEnrollmentHistory();
  }, []);

  const fetchEnrollmentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/enrollment/students/enrollment-history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch enrollment history');
      }

      const data = await response.json();
      setEnrollmentHistory(data.enrollmentHistory || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching enrollment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId, courseName) => {
    const reason = prompt(
      `Why are you unenrolling from "${courseName}"? (optional)`,
      'Personal reasons'
    );

    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/enrollment/courses/${courseId}/unenroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unenroll');
      }

      // Refresh history
      fetchEnrollmentHistory();
      alert('Successfully unenrolled from course');
    } catch (err) {
      setError(err.message);
      console.error('Error unenrolling:', err);
    }
  };

  const getFilteredHistory = () => {
    if (filterStatus === 'all') {
      return enrollmentHistory;
    }
    return enrollmentHistory.filter((record) => record.status === filterStatus);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'enrolled':
        return 'status-enrolled';
      case 'completed':
        return 'status-completed';
      case 'dropped':
        return 'status-dropped';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = getFilteredHistory();

  if (loading) {
    return <div className="enrollment-history-loading">Loading enrollment history...</div>;
  }

  return (
    <div className="enrollment-history-container">
      <div className="enrollment-history-header">
        <h2>Enrollment History</h2>
        <p className="header-subtitle">Track all your course enrollments, completions, and withdrawals</p>
      </div>

      {error && <div className="enrollment-history-error">{error}</div>}

      <div className="filter-section">
        <label className="filter-label">Filter by Status:</label>
        <div className="filter-buttons">
          {['all', 'enrolled', 'completed', 'dropped'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="enrollment-history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((record, index) => (
            <div key={index} className="enrollment-record">
              <div className="record-header">
                <div className="record-info">
                  <h3 className="course-title">
                    {record.course?.title || 'Unknown Course'}
                  </h3>
                  <p className="course-code">{record.course?.code || 'N/A'}</p>
                  {record.course?.instructor && (
                    <p className="instructor-info">
                      Instructor: {record.course.instructor.name || 'Unknown'}
                    </p>
                  )}
                </div>
                <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                  {record.status.toUpperCase()}
                </span>
              </div>

              <div className="record-description">
                {record.course?.description && (
                  <p className="course-description">{record.course.description}</p>
                )}
              </div>

              <div className="record-timeline">
                <div className="timeline-item">
                  <span className="timeline-label">Enrolled:</span>
                  <span className="timeline-date">{formatDate(record.enrolledAt)}</span>
                </div>

                {record.unenrolledAt && (
                  <div className="timeline-item">
                    <span className="timeline-label">
                      {record.status === 'completed' ? 'Completed:' : 'Unenrolled:'}
                    </span>
                    <span className="timeline-date">{formatDate(record.unenrolledAt)}</span>
                  </div>
                )}

                {record.reason && (
                  <div className="timeline-item">
                    <span className="timeline-label">Reason:</span>
                    <span className="timeline-reason">{record.reason}</span>
                  </div>
                )}
              </div>

              {record.status === 'enrolled' && (
                <div className="record-actions">
                  <button
                    className="btn btn-unenroll"
                    onClick={() => handleUnenroll(record.course._id, record.course.title)}
                  >
                    Unenroll from Course
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-history">
            <p>No enrollment history found for this filter.</p>
            {filterStatus !== 'all' && (
              <p className="try-different-filter">Try a different filter or enroll in courses.</p>
            )}
          </div>
        )}
      </div>

      {enrollmentHistory.length > 0 && (
        <div className="history-summary">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Enrollments:</span>
              <span className="stat-value">{enrollmentHistory.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Currently Enrolled:</span>
              <span className="stat-value">
                {enrollmentHistory.filter((e) => e.status === 'enrolled').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">
                {enrollmentHistory.filter((e) => e.status === 'completed').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dropped:</span>
              <span className="stat-value">
                {enrollmentHistory.filter((e) => e.status === 'dropped').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentHistory;

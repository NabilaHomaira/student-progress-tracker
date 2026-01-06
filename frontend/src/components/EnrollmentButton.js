// components/EnrollmentButton.js
// Requirement 2, Feature 2: Course Enrollment Button Component

import React, { useState, useEffect } from 'react';
import {
  requestEnrollment,
  enrollInCourse,
  getEnrollmentStatus,
  cancelEnrollmentRequest,
} from '../services/enrollmentService';
import '../styles/EnrollmentButton.css';

const EnrollmentButton = ({ course, token, onEnrollmentChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (course && token) {
      fetchEnrollmentStatus();
    }
  }, [course, token]);

  const fetchEnrollmentStatus = async () => {
    if (!token || !course?._id) return;

    setLoading(true);
    setError(null);
    try {
      const status = await getEnrollmentStatus(course._id, token);
      setEnrollmentStatus(status);
    } catch (err) {
      console.error('Error fetching enrollment status:', err);
      // Don't show error if user is not logged in
    } finally {
      setLoading(false);
    }
  };

  const handleDirectEnroll = async () => {
    if (!token) {
      setError('Please login to enroll');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await enrollInCourse(course._id, token);
      setError(null);
      await fetchEnrollmentStatus();
      if (onEnrollmentChange) {
        onEnrollmentChange();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEnrollment = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to request enrollment');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await requestEnrollment(course._id, message, token);
      setMessage('');
      setShowRequestForm(false);
      setError(null);
      await fetchEnrollmentStatus();
      if (onEnrollmentChange) {
        onEnrollmentChange();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!enrollmentStatus?.pendingRequest?._id) return;

    if (!window.confirm('Are you sure you want to cancel this enrollment request?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await cancelEnrollmentRequest(enrollmentStatus.pendingRequest._id, token);
      await fetchEnrollmentStatus();
      if (onEnrollmentChange) {
        onEnrollmentChange();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="enrollment-button-container">
        <button className="btn btn-enroll" disabled>
          Login to Enroll
        </button>
      </div>
    );
  }

  if (loading && !enrollmentStatus) {
    return (
      <div className="enrollment-button-container">
        <button className="btn btn-enroll" disabled>
          Loading...
        </button>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.isEnrolled || false;
  const hasPendingRequest = enrollmentStatus?.hasPendingRequest || false;
  const isArchived = course?.isArchived || false;

  return (
    <div className="enrollment-button-container">
      {error && <div className="error-message">{error}</div>}

      {isEnrolled ? (
        <div className="enrollment-status enrolled">
          <span className="status-badge enrolled-badge">✓ Enrolled</span>
        </div>
      ) : hasPendingRequest ? (
        <div className="enrollment-status pending">
          <span className="status-badge pending-badge">⏳ Pending Approval</span>
          <button
            className="btn btn-cancel-request"
            onClick={handleCancelRequest}
            disabled={loading}
          >
            Cancel Request
          </button>
        </div>
      ) : isArchived ? (
        <button className="btn btn-enroll" disabled>
          Course Archived
        </button>
      ) : (
        <div className="enrollment-actions">
          {!showRequestForm ? (
            <>
              <button
                className="btn btn-enroll"
                onClick={handleDirectEnroll}
                disabled={loading}
              >
                {loading ? 'Enrolling...' : 'Enroll Now'}
              </button>
              <button
                className="btn btn-request"
                onClick={() => setShowRequestForm(true)}
                disabled={loading}
              >
                Request Enrollment
              </button>
            </>
          ) : (
            <form className="enrollment-request-form" onSubmit={handleRequestEnrollment}>
              <textarea
                placeholder="Optional message to instructor..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                className="request-message-input"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRequestForm(false);
                    setMessage('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentButton;


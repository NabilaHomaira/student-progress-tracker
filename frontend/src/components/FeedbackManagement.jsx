import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { addFeedback, getAssignmentSubmissions } from '../services/gradeService';
import '../styles/FeedbackManagement.css';

export default function FeedbackManagement({ courseId, assignmentId }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentId || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState({});
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [learningTipsInputs, setLearningTipsInputs] = useState({});

  // Load assignments when component mounts or courseId changes
  useEffect(() => {
    if (courseId && courseId.trim()) {
      loadAssignments();
    } else {
      setAssignments([]);
      setSelectedAssignment('');
      setSubmissions([]);
    }
  }, [courseId]);

  // Load submissions when selected assignment changes
  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assignments/course/${courseId}`);
      setAssignments(response.data || []);
      if (!selectedAssignment && response.data.length > 0) {
        setSelectedAssignment(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(
        `/submissions/assignment/${selectedAssignment}`
      );
      setSubmissions(response.data || []);
      setFeedbackInputs({});
      setLearningTipsInputs({});
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedbackInputs({
      ...feedbackInputs,
      [submissionId]: value,
    });
  };

  const handleLearningTipsChange = (submissionId, value) => {
    setLearningTipsInputs({
      ...learningTipsInputs,
      [submissionId]: value,
    });
  };

  const handleSubmitFeedback = async (submissionId, studentId) => {
    const feedback = feedbackInputs[submissionId];
    const learningTips = learningTipsInputs[submissionId];

    if (!feedback && !learningTips) {
      setError('Please enter feedback or learning tips');
      return;
    }

    try {
      setSubmittingFeedback({ ...submittingFeedback, [submissionId]: true });
      setError('');
      setSuccess('');

      // Submit feedback
      if (feedback) {
        await addFeedback(selectedAssignment, studentId, feedback);
      }

      // Submit learning tips
      if (learningTips) {
        await api.put(`/submissions/${submissionId}`, {
          learningTips,
        });
      }

      setSuccess(`Feedback and tips submitted successfully!`);
      loadSubmissions(); // Reload to get updated data

      // Clear inputs after successful submission
      const newFeedbackInputs = { ...feedbackInputs };
      const newTipsInputs = { ...learningTipsInputs };
      delete newFeedbackInputs[submissionId];
      delete newTipsInputs[submissionId];
      setFeedbackInputs(newFeedbackInputs);
      setLearningTipsInputs(newTipsInputs);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback({
        ...submittingFeedback,
        [submissionId]: false,
      });
    }
  };

  const currentAssignment = assignments.find((a) => a._id === selectedAssignment);

  return (
    <div className="feedback-management">
      <h2>Feedback & Learning Tips Management</h2>

      {!courseId && (
        <div className="alert alert-warning" style={{padding: '15px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', color: '#92400e', marginBottom: '15px'}}>
          ⚠️ Please select a course from the dropdown above to view and provide feedback.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {courseId && assignments.length === 0 && !loading && (
        <div className="alert alert-info" style={{padding: '15px', background: '#dbeafe', border: '1px solid #0284c7', borderRadius: '6px', color: '#0c4a6e', marginBottom: '15px'}}>
          📋 No assignments found for this course. Create an assignment first before you can provide feedback.
        </div>
      )}

      {courseId && (
        <div className="assignment-selector">
          <label htmlFor="assignment-select">Select Assignment:</label>
          <select
            id="assignment-select"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Choose an assignment --</option>
            {assignments.map((assignment) => (
              <option key={assignment._id} value={assignment._id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="loading">Loading submissions...</div>}

      {currentAssignment && !loading && (
        <div className="assignment-details">
          <h3>{currentAssignment.title}</h3>
          <p>{currentAssignment.instructions}</p>
        </div>
      )}

      {!loading && submissions.length === 0 && selectedAssignment && (
        <div className="no-submissions">
          <p>No submissions for this assignment yet.</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="submissions-feedback-container">
          <h3>Student Submissions - Add Feedback & Tips</h3>
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-feedback-card">
              <div className="submission-header">
                <h4>
                  {submission.student?.name ||
                    submission.student?.email ||
                    'Unknown Student'}
                </h4>
                <span className="submission-date">
                  Submitted:{' '}
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>

              {submission.score !== undefined && submission.score !== null && (
                <div className="submission-grade">
                  <strong>Current Grade:</strong> {submission.score} / {submission.maxScore}
                </div>
              )}

              {submission.content && (
                <div className="submission-content">
                  <h5>Student Submission:</h5>
                  <p>{submission.content}</p>
                </div>
              )}

              {submission.feedback && (
                <div className="existing-feedback">
                  <h5>Existing Feedback:</h5>
                  <p>{submission.feedback}</p>
                </div>
              )}

              {submission.learningTips && (
                <div className="existing-tips">
                  <h5>Existing Learning Tips:</h5>
                  <p>{submission.learningTips}</p>
                </div>
              )}

              <div className="feedback-form">
                <div className="form-group">
                  <label htmlFor={`feedback-${submission._id}`}>
                    Add Feedback:
                  </label>
                  <textarea
                    id={`feedback-${submission._id}`}
                    placeholder="Enter personalized feedback for the student..."
                    value={feedbackInputs[submission._id] || submission.feedback || ''}
                    onChange={(e) =>
                      handleFeedbackChange(submission._id, e.target.value)
                    }
                    rows="3"
                    disabled={submittingFeedback[submission._id]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`tips-${submission._id}`}>
                    Learning Tips:
                  </label>
                  <textarea
                    id={`tips-${submission._id}`}
                    placeholder="Enter helpful learning tips and suggestions..."
                    value={learningTipsInputs[submission._id] || submission.learningTips || ''}
                    onChange={(e) =>
                      handleLearningTipsChange(submission._id, e.target.value)
                    }
                    rows="3"
                    disabled={submittingFeedback[submission._id]}
                  />
                </div>

                <button
                  onClick={() =>
                    handleSubmitFeedback(submission._id, submission.student?._id)
                  }
                  disabled={submittingFeedback[submission._id]}
                  className="btn btn-primary"
                >
                  {submittingFeedback[submission._id]
                    ? 'Saving...'
                    : 'Submit Feedback'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

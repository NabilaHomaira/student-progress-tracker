import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { submitGrade, validateScore, getAssignmentSubmissions } from '../services/gradeService';
import '../styles/GradeManagement.css';

export default function GradeManagement({ courseId, assignmentId }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentId || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingGrades, setUpdatingGrades] = useState({});
  const [gradeInputs, setGradeInputs] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);

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
      const response = await api.get(`/assignments/${selectedAssignment}`);
      const assignment = response.data;

      // Fetch all submission data
      const submissionsResponse = await api.get(
        `/submissions/assignment/${selectedAssignment}`
      );
      const submissionsData = submissionsResponse.data || [];

      // Combine submission data with student information
      const enrichedSubmissions = submissionsData.map((submission) => ({
        ...submission,
        maxScore: assignment.maxScore,
      }));

      setSubmissions(enrichedSubmissions);
      setGradeInputs({});
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submissionId, value) => {
    setGradeInputs({
      ...gradeInputs,
      [submissionId]: value,
    });
  };

  const toggleSubmissionView = (submissionId) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
  };

  const handleSubmitGrade = async (submissionId, studentId) => {
    const gradeValue = gradeInputs[submissionId];
    const submission = submissions.find((s) => s._id === submissionId);

    // ENFORCE: Submission must be viewed before grading
    if (expandedSubmission !== submissionId) {
      setError('⚠️ Please view the submission details first before entering a grade');
      return;
    }

    if (!gradeValue && gradeValue !== 0) {
      setError('Please enter a grade');
      return;
    }

    // Validate score
    const validation = validateScore(gradeValue, submission.maxScore);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    try {
      setUpdatingGrades({ ...updatingGrades, [submissionId]: true });
      setError('');
      setSuccess('');

      await submitGrade(selectedAssignment, studentId, parseFloat(gradeValue));

      setSuccess(`Grade submitted successfully!`);
      loadSubmissions(); // Reload to get updated data

      // Clear input after successful submission
      const newInputs = { ...gradeInputs };
      delete newInputs[submissionId];
      setGradeInputs(newInputs);
    } catch (err) {
      setError(err.message || 'Failed to submit grade');
    } finally {
      setUpdatingGrades({ ...updatingGrades, [submissionId]: false });
    }
  };

  const currentAssignment = assignments.find((a) => a._id === selectedAssignment);

  return (
    <div className="grade-management">
      <h2>Grade Management</h2>

      {!courseId && (
        <div className="alert alert-warning" style={{padding: '15px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', color: '#92400e', marginBottom: '15px'}}>
          ⚠️ Please select a course from the dropdown above to view and grade assignments.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {courseId && assignments.length === 0 && !loading && (
        <div className="alert alert-info" style={{padding: '15px', background: '#dbeafe', border: '1px solid #0284c7', borderRadius: '6px', color: '#0c4a6e', marginBottom: '15px'}}>
          📋 No assignments found for this course. Create an assignment first before you can grade submissions.
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
                {assignment.title} (Max: {assignment.maxScore})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="loading">Loading submissions...</div>}

      {currentAssignment && !loading && (
        <div className="assignment-details">
          <h3>{currentAssignment.title}</h3>
          <div className="assignment-meta">
            <p>
              <strong>Max Score:</strong> {currentAssignment.maxScore}
            </p>
            <p>
              <strong>Due Date:</strong>{' '}
              {new Date(currentAssignment.dueDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Total Submissions:</strong> {submissions.length}
            </p>
          </div>
        </div>
      )}

      {!loading && submissions.length === 0 && selectedAssignment && (
        <div className="no-submissions">
          <p>No submissions for this assignment yet.</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="submissions-table">
          <h3>Student Submissions</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Submitted Date</th>
                <th>Submission</th>
                <th>Current Grade</th>
                <th>Max Score</th>
                <th>Enter Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <React.Fragment key={submission._id}>
                  <tr>
                    <td>
                      {submission.student?.name ||
                        submission.student?.email ||
                        'Unknown Student'}
                    </td>
                    <td>
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleSubmissionView(submission._id)}
                        className="btn btn-secondary btn-sm"
                        style={{backgroundColor: '#6366f1', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                      >
                        {expandedSubmission === submission._id ? '▼ Hide' : '▶ View'}
                      </button>
                    </td>
                    <td>
                      {submission.score !== undefined && submission.score !== null
                        ? submission.score
                        : 'Not graded'}
                    </td>
                    <td>{submission.maxScore}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={submission.maxScore}
                        step="0.5"
                        placeholder={expandedSubmission === submission._id ? "Enter grade" : "View submission first"}
                        value={gradeInputs[submission._id] || ''}
                        onChange={(e) =>
                          handleGradeChange(submission._id, e.target.value)
                        }
                        disabled={updatingGrades[submission._id] || expandedSubmission !== submission._id}
                        style={{opacity: expandedSubmission === submission._id ? 1 : 0.5, cursor: expandedSubmission === submission._id ? 'auto' : 'not-allowed'}}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleSubmitGrade(
                            submission._id,
                            submission.student?._id
                          )
                        }
                        disabled={
                          updatingGrades[submission._id] ||
                          !gradeInputs[submission._id] ||
                          expandedSubmission !== submission._id
                        }
                        className="btn btn-primary btn-sm"
                        title={expandedSubmission !== submission._id ? "View submission first" : ""}
                      >
                        {updatingGrades[submission._id] ? 'Saving...' : 'Submit'}
                      </button>
                    </td>
                  </tr>
                  {expandedSubmission === submission._id && (
                    <tr style={{backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb'}}>
                      <td colSpan="7" style={{padding: '20px', verticalAlign: 'top'}}>
                        <div style={{backgroundColor: '#ffffff', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb'}}>
                          <h4 style={{marginTop: 0, marginBottom: '10px', color: '#1f2937'}}>📄 Submission Details</h4>
                          
                          {submission.content ? (
                            <div style={{marginBottom: '15px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px', borderLeft: '3px solid #3b82f6'}}>
                              <p style={{marginTop: 0, marginBottom: '8px', fontWeight: '600', color: '#374151'}}>📝 Content:</p>
                              <p style={{margin: 0, color: '#4b5563', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflowY: 'auto'}}>
                                {submission.content}
                              </p>
                            </div>
                          ) : (
                            <div style={{marginBottom: '15px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '4px', borderLeft: '3px solid #f59e0b', color: '#92400e'}}>
                              No text content provided
                            </div>
                          )}

                          {submission.attachment && (
                            <div style={{marginBottom: '15px', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '4px', borderLeft: '3px solid #10b981'}}>
                              <p style={{marginTop: 0, marginBottom: '8px', fontWeight: '600', color: '#374151'}}>📎 Attachment:</p>
                              <p style={{margin: '0 0 8px 0', color: '#4b5563'}}>
                                <strong>File:</strong> {submission.attachment.originalName || submission.attachment.filename}
                              </p>
                              <p style={{margin: '0 0 8px 0', color: '#4b5563'}}>
                                <strong>Size:</strong> {submission.attachment.size ? (submission.attachment.size / 1024).toFixed(2) + ' KB' : 'N/A'}
                              </p>
                            </div>
                          )}

                          {!submission.content && !submission.attachment && (
                            <div style={{padding: '12px', backgroundColor: '#fee2e2', borderRadius: '4px', borderLeft: '3px solid #ef4444', color: '#991b1b'}}>
                              ⚠️ No submission content or file
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

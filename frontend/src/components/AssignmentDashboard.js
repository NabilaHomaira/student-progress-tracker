import React, { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getAllCourses } from '../services/courseService';
import { getUpcomingDeadlines } from '../services/assignmentService';
import CreateAssignment from './CreateAssignment';
import SubmissionStats from './SubmissionStats';
import '../styles/AssignmentDashboard.css';

export default function AssignmentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'create', 'stats'
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    loadCourses();
  }, []);

  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    } else {
      loadAllAssignments();
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      const coursesData = Array.isArray(response.data) ? response.data : [];
      setCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0]._id);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (courseId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/assignments/course/${courseId}`);
      setAssignments(response.data || []);
      
      // Count overdue assignments
      const now = new Date();
      const overdue = (response.data || []).filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate < now;
      });
      setOverdueCount(overdue.length);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadAllAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      // Only students should see upcoming deadlines
      if (!user || user.role !== 'student') {
        setAssignments([]);
        setOverdueCount(0);
        return;
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const deadlines = await getUpcomingDeadlines(token);
      const assignmentsList = Array.isArray(deadlines) ? deadlines : [];
      setAssignments(assignmentsList);
      
      // Count overdue assignments
      const now = new Date();
      const overdue = assignmentsList.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate < now;
      });
      setOverdueCount(overdue.length);
    } catch (err) {
      console.error('Error loading all assignments:', err);
      setError(err?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignmentCreated = () => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    } else {
      loadAllAssignments();
    }
  };

  return (
    <div className="assignment-dashboard-container">
      <div className="dashboard-header">
        <h1>Assignment Management</h1>
        <div className="header-actions">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Assignment
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Submission Stats
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-label">Total Assignments</div>
              <div className="stat-value">{assignments.length}</div>
            </div>
            <div className={`stat-card ${overdueCount > 0 ? 'stat-card-overdue' : ''}`}>
              <div className="stat-label">Overdue Assignments</div>
              <div className="stat-value overdue-value">{overdueCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Courses</div>
              <div className="stat-value">{courses.filter(c => !c.archived).length}</div>
            </div>
          </div>

          <div className="filters-section">
            <label htmlFor="courseFilter">
              <strong>Filter by Course:</strong>
            </label>
            <select
              id="courseFilter"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="course-filter-select"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="loading-message">Loading assignments...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <>
              {assignments.length === 0 ? (
                <div className="no-assignments">
                  <p>No assignments found. Create your first assignment!</p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab('create')}
                  >
                    Create Assignment
                  </button>
                </div>
              ) : (
                <div className="assignments-grid">
                  {assignments.map((assignment) => {
                    if (!assignment.dueDate) return null;
                    const overdue = isOverdue(assignment.dueDate);
                    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                    // Handle both populated course object and course ID
                    const course = assignment.course && typeof assignment.course === 'object' 
                      ? assignment.course 
                      : courses.find(c => c._id === assignment.course || c._id === assignment.course?._id);

                    return (
                      <div
                        key={assignment._id}
                        className={`assignment-card ${overdue ? 'assignment-overdue' : ''} ${
                          daysUntilDue <= 3 && daysUntilDue > 0 ? 'assignment-urgent' : ''
                        }`}
                      >
                        <div className="assignment-card-header">
                          <h3 className="assignment-title">{assignment.title}</h3>
                          {overdue && (
                            <span className="overdue-badge">OVERDUE</span>
                          )}
                          {!overdue && daysUntilDue <= 3 && daysUntilDue > 0 && (
                            <span className="urgent-badge">DUE SOON</span>
                          )}
                        </div>
                        <div className="assignment-card-body">
                          <div className="assignment-info-row">
                            <span className="info-label">Course:</span>
                            <span className="info-value">
                              {course?.title || 'N/A'} ({course?.code || 'N/A'})
                            </span>
                          </div>
                          <div className="assignment-info-row">
                            <span className="info-label">Due Date:</span>
                            <span className={`info-value ${overdue ? 'overdue-text' : ''}`}>
                              {formatDate(assignment.dueDate)}
                            </span>
                          </div>
                          <div className="assignment-info-row">
                            <span className="info-label">Max Score:</span>
                            <span className="info-value">{assignment.maxScore}</span>
                          </div>
                          {assignment.instructions && (
                            <div className="assignment-instructions">
                              <span className="info-label">Instructions:</span>
                              <p className="instructions-text">{assignment.instructions}</p>
                            </div>
                          )}
                          {overdue && (
                            <div className="overdue-warning">
                              ⚠️ This assignment is overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="assignment-card-footer">
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              // Navigate to assignment details or edit
                              console.log('View assignment:', assignment._id);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-assignment-tab">
          <CreateAssignment onAssignmentCreated={handleAssignmentCreated} />
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-tab">
          <SubmissionStats />
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
// Feature 4: Import from assistant service instead of course service
import {
  getCourseAssistants,
  assignAssistant,
  removeAssistant,
  updateAssistantPermissions,
  getAllUsers,
} from '../services/assistantService';
import '../styles/CourseAssistants.css';

const CourseAssistants = ({ courseId, token, onClose }) => {
  const [assistants, setAssistants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permissions, setPermissions] = useState({
    canViewStudents: true,
    canViewGrades: false,
    canEditGrades: false,
    canManageAssignments: false,
    canViewAssignments: true,
    canManageEnrollments: false,
  });

  useEffect(() => {
    if (courseId && token) {
      fetchAssistants();
    }
  }, [courseId, token]);

  useEffect(() => {
    if (courseId && token && assistants.length >= 0) {
      fetchAvailableUsers();
    }
  }, [courseId, token, assistants]);

  const fetchAssistants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseAssistants(courseId, token);
      setAssistants(response.assistants || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching assistants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await getAllUsers(token);
      const users = response.users || [];
      // Filter out users who are already assistants
      const assistantUserIds = assistants.map((a) => {
        if (typeof a.user === 'object' && a.user._id) {
          return a.user._id.toString();
        }
        return a.user?.toString() || a.user;
      });
      const available = users.filter((user) => {
        const userId = user._id.toString();
        return !assistantUserIds.includes(userId);
      });
      setAvailableUsers(available);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load available users');
    }
  };

  const handleAssignAssistant = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await assignAssistant(courseId, selectedUserId, permissions, token);
      setShowAddForm(false);
      setSelectedUserId('');
      setPermissions({
        canViewStudents: true,
        canViewGrades: false,
        canEditGrades: false,
        canManageAssignments: false,
        canViewAssignments: true,
        canManageEnrollments: false,
      });
      await fetchAssistants();
      await fetchAvailableUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssistant = async (assistantId) => {
    if (!window.confirm('Are you sure you want to remove this assistant?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await removeAssistant(courseId, assistantId, token);
      await fetchAssistants();
      await fetchAvailableUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (assistantId, permissionKey, value) => {
    setLoading(true);
    setError(null);
    try {
      const assistant = assistants.find((a) => a._id === assistantId);
      const updatedPermissions = {
        ...assistant.permissions,
        [permissionKey]: value,
      };
      await updateAssistantPermissions(courseId, assistantId, updatedPermissions, token);
      await fetchAssistants();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const permissionLabels = {
    canViewStudents: 'View Students',
    canViewGrades: 'View Grades',
    canEditGrades: 'Edit Grades',
    canManageAssignments: 'Manage Assignments',
    canViewAssignments: 'View Assignments',
    canManageEnrollments: 'Manage Enrollments',
  };

  return (
    <div className="course-assistants-modal">
      <div className="course-assistants-content">
        <div className="course-assistants-header">
          <h2>Course Assistants</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="assistants-section">
          <div className="section-header">
            <h3>Current Assistants ({assistants.length})</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
            >
              {showAddForm ? 'Cancel' : 'Add Assistant'}
            </button>
          </div>

          {showAddForm && (
            <form className="add-assistant-form" onSubmit={handleAssignAssistant}>
              <div className="form-group">
                <label>Select User:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Select a user --</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Permissions:</label>
                <div className="permissions-grid">
                  {Object.keys(permissions).map((key) => (
                    <label key={key} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={permissions[key]}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [key]: e.target.checked })
                        }
                      />
                      {permissionLabels[key]}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                Assign Assistant
              </button>
            </form>
          )}

          {loading && assistants.length === 0 && !showAddForm ? (
            <div className="loading">Loading assistants...</div>
          ) : assistants.length === 0 ? (
            <div className="no-assistants">No assistants assigned yet.</div>
          ) : (
            <div className="assistants-list">
              {assistants.map((assistant) => (
                <div key={assistant._id} className="assistant-card">
                  <div className="assistant-header">
                    <div className="assistant-info">
                      <h4>{assistant.user?.name || 'Unknown User'}</h4>
                      <p className="assistant-email">{assistant.user?.email || ''}</p>
                      <p className="assistant-role">Role: {assistant.user?.role || 'N/A'}</p>
                      <p className="assistant-assigned">
                        Assigned: {new Date(assistant.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemoveAssistant(assistant._id)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="assistant-permissions">
                    <h5>Permissions:</h5>
                    <div className="permissions-list">
                      {Object.keys(assistant.permissions).map((key) => (
                        <label key={key} className="permission-toggle">
                          <input
                            type="checkbox"
                            checked={assistant.permissions[key]}
                            onChange={(e) =>
                              handlePermissionChange(assistant._id, key, e.target.checked)
                            }
                            disabled={loading}
                          />
                          <span>{permissionLabels[key]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAssistants;


import React, { useState, useEffect } from "react";
import { createAssignment, duplicateAssignment } from "../services/assignmentService";
import { getAllCourses } from "../services/courseService";
import DuplicateAssignment from "./DuplicateAssignment";
import "../styles/CreateAssignment.css";

export default function CreateAssignment({ onAssignmentCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    dueDate: "",
    maxScore: "",
    courseId: "",
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [lastCreatedAssignmentId, setLastCreatedAssignmentId] = useState(null);

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCourses();
      const coursesData = Array.isArray(response.data) ? response.data : [];
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!formData.title.trim()) {
        setError("Title is required");
        setSubmitting(false);
        return;
      }
      if (!formData.instructions.trim()) {
        setError("Instructions are required");
        setSubmitting(false);
        return;
      }
      if (!formData.dueDate) {
        setError("Due date is required");
        setSubmitting(false);
        return;
      }
      if (!formData.maxScore || Number(formData.maxScore) <= 0) {
        setError("Maximum score must be a positive number");
        setSubmitting(false);
        return;
      }
      if (!formData.courseId) {
        setError("Please select a course");
        setSubmitting(false);
        return;
      }

      // Get userId from localStorage if available
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const userId = storedUser?._id || storedUser?.id;

      // Submit assignment
      const assignmentData = {
        title: formData.title.trim(),
        instructions: formData.instructions.trim(),
        dueDate: formData.dueDate,
        maxScore: Number(formData.maxScore),
        courseId: formData.courseId,
      };

      // Add userId if available (for cases where auth middleware doesn't set req.userId)
      if (userId) {
        assignmentData.userId = userId;
      }

      const response = await createAssignment(assignmentData);

      // Backend returns { message, assignment }
      const created = response.data?.assignment || response.data || null;
      if (created) {
        setLastCreatedAssignmentId(created._id || created.id || null);
        setSuccess("✅ Assignment created successfully! Want to duplicate it to other courses?");
        
        // Reset form
        setFormData({
          title: "",
          instructions: "",
          dueDate: "",
          maxScore: "",
          courseId: "",
        });

        // Callback to parent component
        if (onAssignmentCreated) {
          onAssignmentCreated();
        }

        // Show duplicate option after short delay
        setTimeout(() => {
          setShowDuplicateModal(true);
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create assignment. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (showDuplicateModal && lastCreatedAssignmentId) {
    return (
      <DuplicateAssignment
        assignmentId={lastCreatedAssignmentId}
        assignmentTitle={formData.title || "Assignment"}
        onClose={() => {
          setShowDuplicateModal(false);
          setLastCreatedAssignmentId(null);
        }}
        onSuccess={() => {
          setSuccess("✅ Assignment duplicated successfully!");
          setShowDuplicateModal(false);
          setLastCreatedAssignmentId(null);
        }}
      />
    );
  }

  return (
    <div className="create-assignment-container">
      <h2>Create Assignment</h2>

      {loading && courses.length === 0 && (
        <p className="loading-message">Loading courses...</p>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="courseId">
            Course <span className="required">*</span>
          </label>
          <select
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
            disabled={loading || submitting}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Assignment Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter assignment title"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">
            Instructions <span className="required">*</span>
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Enter assignment instructions"
            rows="5"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">
              Due Date <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxScore">
              Maximum Score <span className="required">*</span>
            </label>
            <input
              type="number"
              id="maxScore"
              name="maxScore"
              value={formData.maxScore}
              onChange={handleChange}
              placeholder="100"
              min="0"
              step="0.01"
              required
              disabled={submitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={submitting || loading}
        >
          {submitting ? "Creating..." : "Create Assignment"}
        </button>
      </form>

      {/* Tip box removed per request */}
    </div>
  );
}


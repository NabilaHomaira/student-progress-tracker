import React, { useEffect, useState } from "react";
import { getUpcomingDeadlines } from "../services/assignmentService";
import "../styles/UpcomingDeadlines.css";

export default function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDeadlines = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const data = await getUpcomingDeadlines(token);
        setDeadlines(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load upcoming deadlines");
        console.error("Error loading deadlines:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDeadlines();
  }, []);

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "red":
        return "urgency-red";
      case "yellow":
        return "urgency-yellow";
      case "green":
        return "urgency-green";
      default:
        return "";
    }
  };

  const getUrgencyLabel = (urgency, daysUntilDue) => {
    if (urgency === "red") {
      return daysUntilDue < 0 ? "Overdue" : "Due Today";
    } else if (urgency === "yellow") {
      return `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`;
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter out submitted assignments (only show pending)
  const pendingDeadlines = deadlines.filter((deadline) => !deadline.isSubmitted);

  return (
    <div className="upcoming-deadlines-container">
      <h2>Upcoming Deadlines</h2>

      {loading && <p className="loading">Loading deadlines...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {pendingDeadlines.length === 0 ? (
            <p className="no-deadlines">No upcoming deadlines found.</p>
          ) : (
            <div className="deadlines-list">
              {pendingDeadlines.map((deadline) => (
                <div
                  key={deadline._id}
                  className={`deadline-card ${getUrgencyClass(deadline.urgency)}`}
                >
                  <div className="deadline-header">
                    <h3 className="deadline-title">{deadline.title}</h3>
                    <span className={`urgency-badge ${getUrgencyClass(deadline.urgency)}`}>
                      {getUrgencyLabel(deadline.urgency, deadline.daysUntilDue)}
                    </span>
                  </div>
                  <div className="deadline-details">
                    <p className="deadline-course">
                      <strong>Course:</strong> {deadline.course?.title || "N/A"} (
                      {deadline.course?.code || "N/A"})
                    </p>
                    <p className="deadline-date">
                      <strong>Due Date:</strong> {formatDate(deadline.dueDate)}
                    </p>
                    <p className="deadline-score">
                      <strong>Max Score:</strong> {deadline.maxScore}
                    </p>
                    {deadline.instructions && (
                      <p className="deadline-instructions">
                        <strong>Instructions:</strong> {deadline.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


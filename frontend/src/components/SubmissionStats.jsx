import React, { useEffect, useState } from "react";
import { getAllCourses } from "../services/courseService";
import { getSubmissionStats } from "../services/statsService";
import "../styles/SubmissionStats.css";

export default function SubmissionStats() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [data, setData] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      setErr(null);
      try {
        const response = await getAllCourses();
        const list = Array.isArray(response.data) ? response.data : [];
        setCourses(list);
        if (list.length > 0) setCourseId(list[0]._id);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!courseId) return;
      setLoadingStats(true);
      setErr(null);
      try {
        const res = await getSubmissionStats(courseId);
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load submission stats");
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [courseId]);

  const total = data ? (data.submitted || 0) + (data.pending || 0) + (data.overdue || 0) : 0;

  return (
    <div className="submission-stats-container">
      <h2>Submission Statistics (Per Course)</h2>

      {loadingCourses && <div className="stats-loading">Loading courses…</div>}
      {err && <div className="stats-error">{err}</div>}

      {!loadingCourses && courses.length > 0 && (
        <div className="course-selector">
          <label htmlFor="courseSelect"><strong>Select Course:</strong></label>
          <select 
            id="courseSelect"
            value={courseId} 
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingStats && <div className="stats-loading">Loading statistics…</div>}

      {!loadingStats && !err && data && (
        <>
          {data.course && (
            <div className="course-info">
              <h3>{data.course.title}</h3>
              <p>Course Code: {data.course.code}</p>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card stat-card-submitted">
              <div className="stat-label">Submitted</div>
              <div className="stat-value">{data.submitted || 0}</div>
              <div className="stat-description">
                {total > 0 ? Math.round(((data.submitted || 0) / total) * 100) : 0}% of total
              </div>
            </div>

            <div className="stat-card stat-card-pending">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{data.pending || 0}</div>
              <div className="stat-description">
                {total > 0 ? Math.round(((data.pending || 0) / total) * 100) : 0}% of total
              </div>
            </div>

            <div className="stat-card stat-card-overdue">
              <div className="stat-label">Overdue</div>
              <div className="stat-value">{data.overdue || 0}</div>
              <div className="stat-description">
                {total > 0 ? Math.round(((data.overdue || 0) / total) * 100) : 0}% of total
              </div>
            </div>
          </div>

          <div className="stats-summary">
            <h3>Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Submissions:</span>
                <span className="summary-value">{total}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Completion Rate:</span>
                <span className="summary-value">
                  {total > 0 ? Math.round(((data.submitted || 0) / total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {!loadingStats && !err && !data && courses.length > 0 && (
        <div className="stats-loading">No statistics available for this course.</div>
      )}
    </div>
  );
}
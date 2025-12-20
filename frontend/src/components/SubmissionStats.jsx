
import React, { useEffect, useState } from "react";
import { getAllCourses } from "../services/courseService";
import { getSubmissionStats } from "../services/statsService";

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
        const list = await getAllCourses();
        setCourses(list);
        if (list.length > 0) setCourseId(list[0]._id);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "failed to load courses");
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
        setErr(e?.response?.data?.message || e.message || "failed to load submission stats");
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [courseId]);

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>submission statistics (per course)</h2>

      {loadingCourses && <p>loading courses…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loadingCourses && courses.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label><strong>select course:</strong></label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingStats && <p>loading stats…</p>}

      {!loadingStats && !err && data && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          <div><strong>course:</strong> {data.course?.title} ({data.course?.code})</div>
          <div><strong>submitted:</strong> {data.submitted}</div>
          <div><strong>pending:</strong> {data.pending}</div>
          <div><strong>overdue:</strong> {data.overdue}</div>
        </div>
      )}
    </div>
  );
}
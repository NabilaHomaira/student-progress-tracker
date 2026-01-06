import React, { useEffect, useState } from "react";
import api from '../services/api';

// const th = { padding: 8, textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' };
// const td = { padding: 8, borderBottom: '1px solid #eee' };

function safeJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

export default function StudentProgress() {
  const storedUser = safeJson(localStorage.getItem("user"));
  const [studentId, setStudentId] = useState(
    localStorage.getItem("studentId") || storedUser?._id || ""
  );
  const [data, setData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState('progress'); // 'progress', 'grades', 'feedback'

  const API = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

  const load = async (id) => {
    const sid = (id || "").trim();
    if (!sid) return setErr("Enter studentId first.");
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API}/api/stats/progress/${sid}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || `Failed (${r.status})`);
      setData(j);

      // Load student's submissions for feedback
      try {
        const submissionsResponse = await api.get(`/submissions/student/${sid}`);
        setSubmissions(submissionsResponse.data || []);
      } catch (subErr) {
        console.error('Error loading submissions:', subErr);
      }
    } catch (e) {
      setData(null);
      setErr(e.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) load(studentId);
  }, []);

  const points = Array.isArray(data?.points) ? data.points : [];

  return (
    <div style={{ padding: 16, fontFamily: "system-ui", maxWidth: '1000px', margin: '0 auto' }}>
      <h3 style={{ marginTop: 0 }}>Student Progress & Feedback</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter studentId"
          style={{ padding: 8, minWidth: 240 }}
        />
        <button onClick={() => load(studentId)} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? "Loading…" : "Load"}
        </button>
      </div>

      {/* Tab Navigation */}
      {data && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
          <button 
            onClick={() => setActiveTab('progress')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'progress' ? '#3498db' : '#f0f0f0',
              color: activeTab === 'progress' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'progress' ? '600' : '400'
            }}
          >
            Progress
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'feedback' ? '#3498db' : '#f0f0f0',
              color: activeTab === 'feedback' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'feedback' ? '600' : '400'
            }}
          >
            Feedback & Tips
          </button>
        </div>
      )}

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {/* Progress Tab */}
      {activeTab === 'progress' && data && (
        <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            Student: <b>{data?.studentName || "Unknown"}</b>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Term</th>
                <th style={th}>Course</th>
                <th style={th}>Score</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => {
                const key = `${p?.term || "term"}-${p?.courseCode || "code"}-${i}`;
                return (
                  <tr key={key}>
                    <td style={td}>{p?.term || "-"}</td>
                    <td style={td}>
                      {p?.courseTitle || "Untitled"} ({p?.courseCode || "NO-CODE"})
                    </td>
                    <td style={td}>{typeof p?.score === "number" ? p.score : "-"}</td>
                  </tr>
                );
              })}

              {points.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...td, color: "#666" }}>
                    No progress data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && data && (
        <div style={{ marginTop: 12 }}>
          <h4>Assignment Feedback & Learning Tips</h4>
          {submissions.length === 0 ? (
            <p style={{ color: '#999' }}>No submissions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {submissions.map((submission) => (
                <div 
                  key={submission._id} 
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '15px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <strong>{submission.assignment?.title}</strong>
                    {submission.score !== undefined && submission.score !== null && (
                      <div style={{ color: '#3498db', marginTop: '5px' }}>
                        Grade: <strong>{submission.score} / {submission.assignment?.maxScore}</strong>
                      </div>
                    )}
                  </div>

                  {submission.feedback && (
                    <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '3px solid #ff9800' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#333' }}>Feedback</h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {submission.learningTips && (
                    <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #4caf50' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#333' }}>Learning Tips</h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                        {submission.learningTips}
                      </p>
                    </div>
                  )}

                  {!submission.feedback && !submission.learningTips && (
                    <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No feedback yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function safeJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

const th = { textAlign: "left", padding: 8, borderBottom: "1px solid #eee" };
const td = { padding: 8, borderBottom: "1px solid #f3f3f3" };

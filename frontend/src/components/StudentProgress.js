import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { findStudentByName } from '../services/userService';

const th = { padding: 8, textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' };
const td = { padding: 8, borderBottom: '1px solid #eee' };

function safeJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

export default function StudentProgress() {
  const { user } = useContext(AuthContext);
  const isLoggedStudent = Boolean(user && user.role === 'student');
  const [studentName, setStudentName] = useState(user?.name || "");
  const [studentId, setStudentId] = useState(
    user?._id || localStorage.getItem("studentId") || ""
  );
  const [data, setData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const API = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

  const load = async (idOrName) => {
    setErr("");
    let sid = (idOrName || studentId || '').trim();
    // if input looks like a name, resolve it
    if (!sid && studentName) sid = studentName.trim();
    if (!sid) return setErr("Enter student name first.");

    // if sid is not an ObjectId-like value, try to resolve by name
    const isIdLike = /^[0-9a-fA-F]{24}$/.test(sid);
    if (!isIdLike) {
      const resolved = await findStudentByName(sid).catch(() => null);
      if (!resolved) return setErr('Student not found for that name');
      sid = resolved;
    }
    setLoading(true);
    setErr("");
    try {
      // Use the authenticated-friendly endpoint which accepts either User id or Student id
      // Use axios `api` so Authorization header is included
      const overviewResp = await api.get('/stats/student-progress', { params: { studentId: sid } });
      const overview = overviewResp.data || {};

      // Also fetch grade-history points for term-based chart
      let pointsResp = { data: null };
      try {
        pointsResp = await api.get(`/stats/progress/${sid}`);
      } catch (e) {
        // fallback: if the overview returned course grade arrays, we can synthesize some points
        pointsResp = { data: null };
      }

      // Minimal normalization; charts removed — focus on feedback
      const normalized = { studentId: overview.studentId || sid, studentName: overview.studentName || overview.student?.name || '', courses: overview.courses || overview.courseList || [] };
      setData(normalized);

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
    // If the signed-in user is a student, load their data automatically
    if (isLoggedStudent) {
      load();
      return;
    }

    if (studentId) load(studentId);
    else if (studentName) load(studentName);
  }, []);

  // Charts and progress views removed — component focuses on feedback & tips only.

  return (
    <div style={{ padding: 16, fontFamily: "system-ui", maxWidth: '1000px', margin: '0 auto' }}>
      <h3 style={{ marginTop: 0 }}>Student Progress & Feedback</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
        {!isLoggedStudent && (
          <>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
              style={{ padding: 8, minWidth: 240 }}
            />
            <button onClick={() => load(studentName)} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {loading ? "Loading…" : "Load"}
            </button>
          </>
        )}
        {isLoggedStudent && (
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{color:'#374151'}}>Viewing your grades and feedback</div>
            <button onClick={() => load()} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        )}
      </div>

      {/* Only feedback & tips are shown below */}

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {/* Progress view removed — only feedback & tips are shown below */}

      {/* Feedback Tab */}
      {data && (
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
                    {(() => {
                      const courseName = submission.assignment?.course?.title || submission.course?.title || submission.courseTitle || submission.assignment?.courseName || submission.assignment?.course || submission.course?.code || 'Unknown Course';
                      const assignNum = submission.assignment?.number || submission.assignment?.assignmentNumber || submission.assignment?.index || submission.assignmentNumber || null;
                      return (
                        <div style={{marginBottom:6}}>
                          <div style={{fontWeight:800, color:'#0f172a'}}>{courseName}{assignNum ? ` — Assignment ${assignNum}` : ''}</div>
                          <div style={{fontSize:14,color:'#374151',marginTop:4}}>{submission.assignment?.title || submission.assignmentTitle || ''}</div>
                        </div>
                      );
                    })()}
                    {submission.score !== undefined && submission.score !== null && (
                      <div style={{ color: '#3498db', marginTop: '6px' }}>
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

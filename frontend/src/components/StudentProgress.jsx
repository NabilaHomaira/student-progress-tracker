
import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

export default function StudentProgress() {
  const storedUser = safeJson(localStorage.getItem("user"));
  const [studentId, setStudentId] = useState(
    localStorage.getItem("studentId") || storedUser?._id || ""
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
    } catch (e) {
      setData(null);
      setErr(e.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) load(studentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const points = Array.isArray(data?.points) ? data.points : [];

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Student Progress</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter studentId"
          style={{ padding: 8, minWidth: 240 }}
        />
        <button onClick={() => load(studentId)} disabled={loading}>
          {loading ? "Loading…" : "Load"}
        </button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {data && (
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
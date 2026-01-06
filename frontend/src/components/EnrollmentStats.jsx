
import React, { useEffect, useState } from "react";
import { getEnrollmentStats } from "../services/statsService";

export default function EnrollmentStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getEnrollmentStats();
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "failed to load enrollment stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>enrollment statistics</h2>

      {loading && <p>loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && data && (
        <div style={{ display: "grid", gap: 8 }}>
          <div><strong>total students:</strong> {data.totalStudents}</div>
          <div><strong>total enrollments:</strong> {data.totalEnrollments}</div>
          <div><strong>average performance:</strong> {data.averagePerformance ?? "n/a"}</div>
        </div>
      )}
    </div>
  );
}

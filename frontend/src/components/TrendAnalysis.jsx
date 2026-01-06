
// import React, { useState } from "react";
// import { getTrendAnalysis } from "../services/statsService";

// export default function TrendAnalysis() {
//   const [studentId, setStudentId] = useState("");
//   const [data, setData] = useState(null);

//   const load = () => {
//     getTrendAnalysis(studentId).then(setData);
//   };

//   return (
//     <div>
//       <h3>Trend Analysis</h3>
//       <input
//         placeholder="Student ID"
//         value={studentId}
//         onChange={(e) => setStudentId(e.target.value)}
//       />
//       <button onClick={load}>Load</button>

//       {data && (
//         <ul>
//           {data.studentSeries.map((t, i) => (
//             <li key={i}>
//               Term {t.term}: Student {t.score}, Class {data.classSeries[i].score}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }


import React, { useState } from "react";
import { getTrendAnalysis } from "../services/statsService";

export default function TrendAnalysis() {
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async () => {
    if (!studentId.trim()) {
      setErr("enter student id first");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await getTrendAnalysis(studentId.trim());
      setData(res);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>trend analysis (student vs class)</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          style={{ padding: 8, minWidth: 260 }}
          placeholder="student id"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button onClick={load}>load</button>
      </div>

      {loading && <p>loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && data && (
        <div style={{ marginTop: 12 }}>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>term</th>
                <th>student avg</th>
                <th>class avg</th>
              </tr>
            </thead>
            <tbody>
              {(data.studentSeries || []).map((s, idx) => {
                const c = (data.classSeries || [])[idx];
                return (
                  <tr key={s.term}>
                    <td>{s.term}</td>
                    <td>{s.score ?? "n/a"}</td>
                    <td>{c?.score ?? "n/a"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p style={{ marginTop: 10, color: "#555" }}>
            (this uses your backend terms from gradeHistory.termLabel)
          </p>
        </div>
      )}
    </div>
  );
}
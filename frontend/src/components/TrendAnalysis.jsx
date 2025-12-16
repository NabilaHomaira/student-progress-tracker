
import React, { useState } from "react";
import { getTrendAnalysis } from "../services/statsService";

export default function TrendAnalysis() {
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);

  const load = () => {
    getTrendAnalysis(studentId).then(setData);
  };

  return (
    <div>
      <h3>Trend Analysis</h3>
      <input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <button onClick={load}>Load</button>

      {data && (
        <ul>
          {data.studentSeries.map((t, i) => (
            <li key={i}>
              Term {t.term}: Student {t.score}, Class {data.classSeries[i].score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
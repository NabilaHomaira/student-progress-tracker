
import React, { useState } from "react";
import { getStudentProgress } from "../services/statsService";

export default function StudentProgress() {
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);

  const load = () => {
    getStudentProgress(studentId).then(setData);
  };

  return (
    <div>
      <h3>Student Progress</h3>
      <input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <button onClick={load}>Load</button>

      {data && (
        <ul>
          {data.points.map((p, i) => (
            <li key={i}>
              {p.term} - {p.courseCode}: {p.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
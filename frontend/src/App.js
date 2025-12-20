import React from "react";
import CourseList from "./components/CourseList";
import EnrollmentStats from "./components/EnrollmentStats";
import SubmissionStats from "./components/SubmissionStats";
import TrendAnalysis from "./components/TrendAnalysis";
import StudentProgress from "./components/StudentProgress";

export default function App() {
  return (
    <div>
      <div style={{ padding: 16, borderBottom: "2px solid #222" }}>
        <h1 style={{ margin: 0 }}>student progress tracker</h1>
        <p style={{ margin: "6px 0 0 0" }}>
          
        </p>
      </div>

      <CourseList />
      <EnrollmentStats />
      <SubmissionStats />
      <TrendAnalysis />
      <StudentProgress />
    </div>
  );
}

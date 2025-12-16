
import React, { useState } from "react";

export default function CourseSelector({ onSelect }) {
  const [courseId, setCourseId] = useState("");

  return (
    <div>
      <h3>Select Course</h3>
      <input
        placeholder="Enter Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      />
      <button onClick={() => onSelect(courseId)}>Select</button>
    </div>
  );
}
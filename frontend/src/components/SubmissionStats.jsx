
import React, { useEffect, useState } from "react";
import { getSubmissionStats } from "../services/statsService";

export default function SubmissionStats({ courseId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (courseId) {
      getSubmissionStats(courseId).then(setData);
    }
  }, [courseId]);

  if (!courseId) return <p>Select a course</p>;
  if (!data) return <p>Loading submission stats...</p>;

  return (
    <div>
      <h3>Submission Statistics</h3>
      <p>Submitted: {data.submitted}</p>
      <p>Pending: {data.pending}</p>
      <p>Overdue: {data.overdue}</p>
    </div>
  );
}
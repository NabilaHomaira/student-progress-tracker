
import React, { useEffect, useState } from "react";
import { getEnrollmentStats } from "../services/statsService";

export default function EnrollmentStats() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEnrollmentStats().then(setData);
  }, []);

  if (!data) return <p>Loading enrollment stats...</p>;

  return (
    <div>
      <h3>Enrollment Statistics</h3>
      <p>Total Students: {data.totalStudents}</p>
      <p>Total Enrollments: {data.totalEnrollments}</p>
      <p>Average Performance: {data.averagePerformance}</p>
    </div>
  );
}
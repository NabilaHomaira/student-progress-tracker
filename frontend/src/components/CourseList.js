// import React, { useEffect, useState } from "react";

// export default function CourseList() {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   const loadCourses = async () => {
//     try {
//       setLoading(true);
//       setErr("");

//       const res = await fetch("/api/courses");
//       if (!res.ok) throw new Error("Failed to fetch courses");

//       const data = await res.json();
//       setCourses(data);
//     } catch (e) {
//       console.error(e);
//       setErr("Could not load courses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCourses();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Courses</h2>

//       <button onClick={loadCourses}>Refresh</button>

//       {loading && <p>Loading…</p>}
//       {err && <p style={{ color: "red" }}>{err}</p>}

//       {!loading && courses.length === 0 && <p>No courses found.</p>}

//       {courses.map((course) => {
//         // ✅ THIS IS THE FIX
//         const instructorText =
//           typeof course.instructor === "string"
//             ? course.instructor
//             : course.instructor?.name || "Unknown";

//         return (
//           <div
//             key={course._id}
//             style={{
//               border: "1px solid #ccc",
//               padding: "10px",
//               marginBottom: "10px",
//               borderRadius: "6px",
//             }}
//           >
//             <h3>{course.title}</h3>
//             <p>
//               <strong>Code:</strong> {course.code}
//             </p>
//             <p>
//               <strong>Instructor:</strong> {instructorText}
//             </p>
//             <p>{course.description}</p>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr("Could not load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Courses</h2>

      <button onClick={loadCourses}>Refresh</button>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && courses.length === 0 && <p>No courses found.</p>}

      {courses.map((course) => {
        // instructor can be a string OR an object
        const instructorText =
          typeof course.instructor === "string"
            ? course.instructor
            : course.instructor?.name || "Unknown";

        // enrolledStudents may be missing or not an array
        const enrolledCount = Array.isArray(course.enrolledStudents)
          ? course.enrolledStudents.length
          : 0;

        // capacity may be missing
        const capacity =
          typeof course.capacity === "number" ? course.capacity : null;

        // availability
        const seatsAvailable =
          capacity === null ? "N/A" : Math.max(capacity - enrolledCount, 0);

        return (
          <div
            key={course._id}
            style={{
              border: "1px solid #201062ff",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <h3>{course.title}</h3>

            <p>
              <strong>Code:</strong> {course.code || "N/A"}
            </p>

            <p>
              <strong>Instructor:</strong> {instructorText}
            </p>

            {/* ✅ Course availability */}
            <p>
              <strong>Seats available:</strong> {seatsAvailable}
            </p>
            <p>
              <strong>Enrolled students:</strong> {enrolledCount}
            </p>
            <p>
              <strong>Capacity:</strong> {capacity ?? "N/A"}
            </p>

            <p>{course.description}</p>
          </div>
        );
      })}
    </div>
  );
}
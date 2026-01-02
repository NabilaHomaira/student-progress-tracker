
// require("dotenv").config();
// const connectDB = require("./config/db");

// const User = require("./models/User");
// const Course = require("./models/Course");
// const Student = require("./models/student");

// async function seed() {
//   await connectDB();

//   await User.deleteMany();
//   await Course.deleteMany();
//   await Student.deleteMany();

//   const instructor = await User.create({
//     name: "Dr Smith",
//     email: "smith@test.com",
//     password: "password123",
//     role: "teacher"
//   });

//   const course = await Course.create({
//     title: "Web Development",
//     code: "CSE101",
//     description: "Intro to Web",
//     instructor: instructor._id
//   });

//   await Student.create({
//     name: "Alice Student",
//     email: "alice@student.com",

//     enrollments: [
//       {
//         course: course._id,
//         status: "enrolled"
//       }
//     ],

//     enrollmentHistory: [
//       {
//         course: course._id,
//         status: "enrolled"
//       }
//     ]
//   });

//   console.log(" Database seeded successfully");
//   process.exit();
// }

// seed().catch(err => {
//   console.error(err);
//   process.exit(1);
// });



require("dotenv").config();
const connectDB = require("./config/db");

const User = require("./models/User");
const Course = require("./models/Course");
const Student = require("./models/student");

async function seed() {
  await connectDB();

  await User.deleteMany();
  await Course.deleteMany();
  await Student.deleteMany();
  const instructor = await User.create({
    name: "Dr Smith",
    email: "smith@test.com",
    password: "password123",
    role: "teacher",
  });

  const studentUser1 = await User.create({
    name: "Alice Student",
    email: "alice@student.com",
    password: "password123",
    role: "student",
  });

  const studentUser2 = await User.create({
    name: "Bob Student",
    email: "bob@student.com",
    password: "password123",
    role: "student",
  });

  const studentUser3 = await User.create({
    name: "Charlie Student",
    email: "charlie@student.com",
    password: "password123",
    role: "student",
  });

  // -------------------------
  // 2) Create Courses
  // -------------------------
  const course1 = await Course.create({
    title: "Software Engineering",
    code: "CSE470",
    // description: "Software Engineering",
    instructor: {name:'Saliba Rahman',email:'saliba@uni.com'},
    enrolledStudents: [studentUser1._id, studentUser2._id, studentUser3._id],
    isArchived: false,
    archiveDate: null,
  });

  const course2 = await Course.create({
    title: "Data Structures",
    code: "CSE220",
    // description: "Data Structures",
    instructor: {name:'Farham Iqbal',email:'farham@uni.com'},
    enrolledStudents: [studentUser1._id, studentUser2._id], 
    isArchived: false,
    archiveDate: null,
  });
  const alice = await Student.create({
    name: "Alice Student",
    email: "alice@student.com",

    enrollments: [
      { course: course1._id, status: "enrolled" },
      { course: course2._id, status: "enrolled" },
    ],

    enrollmentHistory: [
      { course: course1._id, status: "enrolled" },
      { course: course2._id, status: "enrolled" },
    ],

    assignmentStats: [
      { course: course1._id, submitted: 8, pending: 1, overdue: 0 },
      { course: course2._id, submitted: 6, pending: 2, overdue: 1 },
    ],

    gradeHistory: [
      { termLabel: "Midterm", course: course1._id, score: 78 },
      { termLabel: "Final", course: course1._id, score: 86 },
      { termLabel: "Midterm", course: course2._id, score: 74 },
      { termLabel: "Final", course: course2._id, score: 82 },
    ],
  });

  const bob = await Student.create({
    name: "Bob Student",
    email: "bob@student.com",

    enrollments: [
      { course: course1._id, status: "enrolled" },
      { course: course2._id, status: "enrolled" },
    ],

    enrollmentHistory: [
      { course: course1._id, status: "enrolled" },
      { course: course2._id, status: "enrolled" },
    ],

    assignmentStats: [
      { course: course1._id, submitted: 5, pending: 3, overdue: 1 },
      { course: course2._id, submitted: 4, pending: 3, overdue: 2 },
    ],

    gradeHistory: [
      { termLabel: "Midterm", course: course1._id, score: 60 },
      { termLabel: "Final", course: course1._id, score: 67 },
      { termLabel: "Midterm", course: course2._id, score: 58 },
      { termLabel: "Final", course: course2._id, score: 63 },
    ],
  });

  const charlie = await Student.create({
    name: "Charlie Student",
    email: "charlie@student.com",

    enrollments: [{ course: course1._id, status: "enrolled" }],

    enrollmentHistory: [{ course: course1._id, status: "enrolled" }],

    assignmentStats: [{ course: course1._id, submitted: 9, pending: 0, overdue: 0 }],

    gradeHistory: [
      { termLabel: "Midterm", course: course1._id, score: 88 },
      { termLabel: "Final", course: course1._id, score: 92 },
    ],
  });

  console.log("Database seeded successfully");
  console.log("Instructor User ID:", instructor._id.toString());
  console.log("Student IDs for UI:");
  console.log("Alice:", alice._id.toString());
  console.log("Bob:", bob._id.toString());
  console.log("Charlie:", charlie._id.toString());

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
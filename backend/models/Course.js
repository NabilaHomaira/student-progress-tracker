// const mongoose = require('mongoose');

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     enrolledStudents: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//       },
//     ],
//     isArchived: {
//       type: Boolean,
//       default: false,
//     },
//     archiveDate: {
//       type: Date,
//       default: null,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // module.exports = mongoose.model('Course', courseSchema);
// module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);


// const mongoose = require("mongoose");

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     enrolledStudents: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     isArchived: {
//       type: Boolean,
//       default: false,
//     },
//     archiveDate: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // Prevent OverwriteModelError in dev/hot-reload
// module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);



// const mongoose = require("mongoose");

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ✅ NEW: total seats available in the course
//     capacity: {
//       type: Number,
//       default: 30,
//       min: 1,
//     },

//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // If you use assistants/co-instructors
//     assistantIds: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],

//     // If you track who enrolled (optional, but you already have it)
//     enrolledStudents: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],

//     archived: {
//       type: Boolean,
//       default: false,
//     },

//     archiveDate: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Course", courseSchema);




const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },

    // ✅ Option A: embed instructor (NO ObjectId)
    instructor: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
    },

    capacity: { type: Number, default: 30 },

    // keep your students as IDs (this is fine)
    enrolledStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    ],

    assistantIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    archived: { type: Boolean, default: false },
    archiveDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema)
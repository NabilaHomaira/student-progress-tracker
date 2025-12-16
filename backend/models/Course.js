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


const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archiveDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
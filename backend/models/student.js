
const mongoose = require("mongoose");
const { Schema } = mongoose;

const enrollmentSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["enrolled", "dropped", "completed"],
      default: "enrolled",
    },
  },
  { _id: false }
);

const assignmentStatsSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    submitted: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
  },
  { _id: false }
);

const gradePointSchema = new Schema(
  {
    termLabel: String,
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    score: Number,
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    enrollments: [enrollmentSchema],
    assignmentStats: [assignmentStatsSchema],
    gradeHistory: [gradePointSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
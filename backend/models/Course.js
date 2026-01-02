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
      default: "",
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Requirement 1 – Feature 4
    // `assistants` stores objects with permissions; keep `assistantIds` for legacy lookups
    assistants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        permissions: {
          canViewStudents: { type: Boolean, default: true },
          canViewGrades: { type: Boolean, default: false },
          canEditGrades: { type: Boolean, default: false },
          canManageAssignments: { type: Boolean, default: false },
          canViewAssignments: { type: Boolean, default: true },
          canManageEnrollments: { type: Boolean, default: false },
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    assistantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Requirement 2
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    capacity: {
      type: Number,
      default: 30,
    },

    archived: {
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

module.exports = mongoose.model("Course", courseSchema);

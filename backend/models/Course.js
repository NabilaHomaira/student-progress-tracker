// models/Course.js
const mongoose = require('mongoose');

const assistantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permissions: {
      canViewStudents: { type: Boolean, default: false },
      canViewGrades: { type: Boolean, default: false },
      canEditGrades: { type: Boolean, default: false },
      canManageAssignments: { type: Boolean, default: false },
      canViewAssignments: { type: Boolean, default: true },
      canManageEnrollments: { type: Boolean, default: false },
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assistants: [assistantSchema],

    enrolledStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],

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

module.exports = mongoose.model('Course', courseSchema);


const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    instructorName: { type: String, required: true },
    totalSeats: { type: Number, default: 30 },
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.enrolledCount;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
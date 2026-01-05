// Quick test script to check courses in MongoDB
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/Course");

async function testCourses() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");
    
    console.log("\nFetching all courses...");
    const courses = await Course.find({}).lean();
    console.log(`Found ${courses.length} courses in database`);
    
    if (courses.length > 0) {
      console.log("\nCourses found:");
      courses.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.title || 'No title'}`);
        console.log(`   Code: ${course.code || 'No code'}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Instructor: ${course.instructor || 'No instructor'}`);
        console.log(`   Archived: ${course.archived || false}`);
      });
    } else {
      console.log("\nNo courses found in database!");
      console.log("Make sure you inserted data into the 'courses' collection");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testCourses();


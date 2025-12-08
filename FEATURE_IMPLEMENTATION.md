# Requirement 1, Feature 2: Archive/Unarchive Courses

## Overview
This feature allows teachers to archive or reactivate existing courses while preserving all previous records and data. Archived courses remain in the system for historical purposes but are not visible in the active courses list by default.

## Implementation Details

### Backend Structure

#### Models
- **Course Model** (`backend/models/Course.js`)
  - `isArchived`: Boolean field to track archive status (default: false)
  - `archiveDate`: Timestamp of when the course was archived
  - Includes fields for: title, code, description, instructor, enrolledStudents, timestamps

- **User Model** (`backend/models/User.js`)
  - Referenced by Course model for instructor and student relationships
  - Fields: name, email, password, role (student/teacher/admin)

#### Controllers
- **Course Controller** (`backend/controllers/courseController.js`)
  - `archiveCourse(id)`: Archives a course and records the archive date
  - `unarchiveCourse(id)`: Reactivates an archived course
  - `getAllCourses()`: Fetches courses with optional filter for archived courses
  - `getCourseById(id)`: Retrieves a specific course
  - `createCourse()`: Creates a new active course
  - `updateCourse()`: Updates course details

#### Routes
- **Course Routes** (`backend/routes/courseRoutes.js`)
  - `POST /api/courses` - Create a new course
  - `GET /api/courses?includeArchived=true|false` - Get all courses
  - `GET /api/courses/:id` - Get course by ID
  - `PUT /api/courses/:id` - Update course details
  - `PATCH /api/courses/:id/archive` - Archive a course
  - `PATCH /api/courses/:id/unarchive` - Unarchive a course

### Frontend Structure

#### Components
- **CourseCard** (`frontend/src/components/CourseCard.js`)
  - Displays individual course information
  - Shows archive status badge for archived courses
  - Archive/Unarchive buttons based on course status
  - Displays enrolled student count and archive date

- **CourseList** (`frontend/src/components/CourseList.js`)
  - Container component for displaying all courses
  - Toggle checkbox to show/hide archived courses
  - Handles archive/unarchive operations
  - Error handling and loading states

#### Services
- **Course Service** (`frontend/src/services/courseService.js`)
  - Centralized API calls for course operations
  - Functions for archive, unarchive, CRUD operations
  - Error handling and response parsing

#### Styling
- **CourseCard CSS** (`frontend/src/styles/CourseCard.css`)
  - Responsive card layout
  - Archive badge styling
  - Button states and hover effects
  - Archived course visual differentiation

- **CourseList CSS** (`frontend/src/styles/CourseList.css`)
  - Container styling
  - Header and filter controls
  - Responsive design for mobile devices
  - Error and loading states

## API Endpoints

### Archive a Course
```
PATCH /api/courses/:id/archive

Response:
{
  "message": "Course archived successfully",
  "course": {
    "_id": "...",
    "title": "...",
    "isArchived": true,
    "archiveDate": "2025-12-07T10:30:00Z",
    ...
  }
}
```

### Unarchive a Course
```
PATCH /api/courses/:id/unarchive

Response:
{
  "message": "Course reactivated successfully",
  "course": {
    "_id": "...",
    "title": "...",
    "isArchived": false,
    "archiveDate": null,
    ...
  }
}
```

### Get Courses with Archive Filter
```
GET /api/courses?includeArchived=false

Response:
{
  "message": "Courses retrieved successfully",
  "courses": [...]
}
```

## Features

1. **Archive Courses**: Teachers can archive completed or inactive courses
2. **Preserve Records**: All student data, grades, and assignments are preserved
3. **Unarchive Functionality**: Archived courses can be reactivated if needed
4. **Visual Indicators**: Archived courses are clearly marked with badges
5. **Filter Control**: Users can toggle between active and archived courses
6. **Metadata Tracking**: Archive date is recorded for audit purposes
7. **Validation**: System prevents invalid state transitions

## Setup Instructions

### Backend Setup
1. Ensure MongoDB is running
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-progress-tracker
   NODE_ENV=development
   ```
4. Start server: `npm start` (or configure in package.json)

### Frontend Setup
1. Install dependencies: `npm install`
2. Create `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
3. Import CourseList component in App.js:
   ```javascript
   import CourseList from './components/CourseList';
   
   function App() {
     return <CourseList />;
   }
   ```
4. Start React app: `npm start`

## Usage Flow

1. **View Courses**: Teacher sees list of active courses
2. **Archive Course**: Click "Archive Course" button on any course
3. **Confirm Archive**: Course immediately archived with visual feedback
4. **View Archived**: Check "Show Archived Courses" to see archived courses
5. **Reactivate**: Click "Reactivate Course" to bring course back to active status

## Error Handling

- Course not found: Returns 404 error
- Already archived: Returns 400 error with appropriate message
- Not archived: Returns 400 error if trying to unarchive an active course
- Database errors: Returns 500 error with error details

## Future Enhancements

1. Add permissions/authorization (only course instructors can archive)
2. Bulk archive/unarchive operations
3. Archive reason/notes field
4. Archive history/audit log
5. Scheduled archive cleanup
6. Archive expiration policies

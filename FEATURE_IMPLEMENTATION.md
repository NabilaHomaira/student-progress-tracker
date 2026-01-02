# Feature Implementation Documentation

## Requirement 1, Feature 2: Archive/Unarchive Courses

### Overview
Teachers can archive or reactivate courses while preserving all records. Archived courses remain in the system for historical purposes but are not visible by default.

---

## Requirement 2, Feature 4: Course Enrollment History

### Overview
Students can view their complete course enrollment history, including currently enrolled, completed, and dropped courses. All enrollment records are permanently preserved with timestamps and reasons for unenrollment.

### Backend Implementation

#### 1. **Student Model** (`backend/models/student.js`) - UPDATED
Added `enrollmentHistorySchema`:
- `course`: Course reference
- `status`: "enrolled" | "dropped" | "completed"
- `enrolledAt`: Enrollment timestamp
- `unenrolledAt`: Unenrollment/completion timestamp
- `reason`: User-provided reason for status change

#### 2. **Enrollment Controller** (`backend/controllers/enrollmentController.js`) - NEW METHODS

**`getEnrollmentHistory()`**
- Fetches all enrollment history records for logged-in student
- Populates course and instructor details
- Returns sorted enrollment history

**`unenrollFromCourse()`**
- Removes student from course enrollment
- Records unenrollment in history with "dropped" status
- Captures reason for unenrollment
- Preserves all assignment/grade data
- Validates student enrollment status

**`markCourseAsCompleted()`**
- Updates enrollment status to "completed"
- Records completion in history
- Triggers when course ends or student completes it

#### 3. **Enrollment Routes** (`backend/routes/enrollmentRoutes.js`) - NEW ROUTES

```javascript
GET /api/enrollment/students/enrollment-history
POST /api/enrollment/courses/:courseId/unenroll
POST /api/enrollment/courses/:courseId/mark-completed
```

### Frontend Implementation

#### 1. **EnrollmentHistory Component** (`frontend/src/components/EnrollmentHistory.js`) - NEW
Features:
- Display complete enrollment history with course details
- Status filtering (All, Enrolled, Completed, Dropped)
- Timeline view with enrollment/unenrollment dates
- Unenroll button for currently enrolled courses
- Summary statistics (total, enrolled, completed, dropped)
- Error handling and loading states

#### 2. **EnrollmentHistory Styles** (`frontend/src/styles/EnrollmentHistory.css`) - NEW
- Responsive card layout
- Status badge color coding:
  - 🔵 Enrolled (Blue)
  - ✅ Completed (Green)
  - ❌ Dropped (Red)
- Timeline visualization
- Mobile responsive (768px, 480px breakpoints)
- Professional typography and spacing

#### 3. **Enrollment Service** (`frontend/src/services/enrollmentService.js`) - UPDATED
New functions:
- `getEnrollmentHistory(token)`: Fetch history
- `unenrollFromCourse(courseId, reason, token)`: Unenroll with reason
- `markCourseAsCompleted(courseId, token)`: Mark as completed

### API Endpoints

#### Get Enrollment History
```http
GET /api/enrollment/students/enrollment-history
Authorization: Bearer {token}

Response:
{
  "enrollmentHistory": [
    {
      "course": { "_id", "title", "code", "description", "instructor" },
      "status": "completed|dropped|enrolled",
      "enrolledAt": "2025-09-01T08:00:00Z",
      "unenrolledAt": "2025-12-15T16:30:00Z",
      "reason": "Course completed successfully"
    }
  ]
}
```

#### Unenroll from Course
```http
POST /api/enrollment/courses/:courseId/unenroll
Authorization: Bearer {token}
Content-Type: application/json

Body: { "reason": "Personal reasons" }

Response:
{
  "message": "Successfully unenrolled from course. Records have been preserved.",
  "course": { "_id", "title", "code" }
}
```

#### Mark Course as Completed
```http
POST /api/enrollment/courses/:courseId/mark-completed
Authorization: Bearer {token}

Response:
{
  "message": "Course marked as completed successfully",
  "course": { "_id", "title", "code" }
}
```

### Data Preservation

When student drops course:
- ✅ Enrollment history record created with "dropped" status
- ✅ All assignment submissions preserved
- ✅ All grades preserved
- ✅ Unenrollment reason recorded
- ✅ Date/time of unenrollment recorded

### Error Handling

| Error | Status | Cause |
|-------|--------|-------|
| Course not found | 404 | Invalid course ID |
| User not found | 404 | Student doesn't exist |
| Not enrolled | 400 | Student not in course |
| Only students can unenroll | 403 | Non-student role |

### Usage Flow

1. Student navigates to "My Enrollment History"
2. Component displays all courses with statuses
3. Use filter buttons to view specific status
4. Click "Unenroll from Course" on active course
5. Enter reason for unenrollment
6. Course updates to "Dropped" status
7. View summary statistics

### Features Summary

✅ Complete enrollment history tracking
✅ Status filtering (enrolled, completed, dropped)
✅ Timeline visualization with dates
✅ Unenrollment reason tracking
✅ Data preservation on unenrollment
✅ Summary statistics dashboard
✅ Responsive mobile design
✅ Comprehensive error handling

---

## Requirement 1, Feature 2: Archive/Unarchive Courses

### Overview
Teachers can archive or reactivate courses while preserving all records. Archived courses remain in the system for historical purposes but are not visible in the active courses list by default.

### Backend Implementation

#### 1. **Course Model** (`backend/models/Course.js`)
- `isArchived`: Boolean field (default: false)
- `archiveDate`: Timestamp when archived
- `instructor`: Reference to User
- `enrolledStudents`: Array of student references
- `assistants`: Array of co-instructors with permissions

#### 2. **Course Controller** (`backend/controllers/courseController.js`)
- `archiveCourse()`: Archive with date recording
- `unarchiveCourse()`: Reactivate archived course
- `getAllCourses()`: List with archive filter
- `getCourseById()`: Get single course
- `createCourse()`: Create new course
- `updateCourse()`: Update course details

#### 3. **Course Routes** (`backend/routes/courseRoutes.js`)
```javascript
POST /api/courses - Create
GET /api/courses?includeArchived=true|false - List
GET /api/courses/:id - Get by ID
PUT /api/courses/:id - Update
PATCH /api/courses/:id/archive - Archive
PATCH /api/courses/:id/unarchive - Unarchive
```

### Frontend Implementation

#### 1. **CourseCard Component** (`frontend/src/components/CourseCard.js`)
- Display course information
- Archive status badge
- Archive/Unarchive buttons
- Enrolled student count
- Archive date display

#### 2. **CourseList Component** (`frontend/src/components/CourseList.js`)
- List all courses
- Toggle to show/hide archived
- Archive/unarchive operations
- Error handling
- Loading states

#### 3. **Course Service** (`frontend/src/services/courseService.js`)
API functions for all course operations

### Key Features
✅ Archive courses for record preservation
✅ Unarchive courses when needed
✅ Filter between active and archived
✅ Visual indicators for archived courses
✅ Complete data preservation
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

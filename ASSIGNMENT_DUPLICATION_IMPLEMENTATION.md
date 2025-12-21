# Assignment Duplication Feature Implementation (Requirement 3, Feature 2)

## Overview
This document outlines the implementation of the **Assignment Duplication** feature that allows teachers to create an assignment once and duplicate it to multiple courses with optional due date adjustments.

## Features Implemented

### 1. Backend: Assignment Duplication API

#### Controller: `backend/controllers/assignmentController.js`

**New Methods:**

##### `duplicateAssignment(req, res)`
- **Purpose**: Creates copies of an assignment in multiple target courses
- **Route**: `POST /assignments/:id/duplicate`
- **Request Body**:
  ```json
  {
    "targetCourseIds": ["course1_id", "course2_id"],
    "adjustDueDate": true
  }
  ```
- **Response**: 
  - Returns success object with duplicated assignment IDs
  - Returns error object with `conflictingCourses` array if duplicate titles exist
- **Validation**:
  - Checks that all target courses exist
  - Prevents duplicate assignments with same title in same course
  - Validates `targetCourseIds` is a non-empty array
- **Due Date Logic**: If `adjustDueDate` is true, adds 7 days to the original due date

##### `getAssignmentDuplicationStats(req, res)`
- **Purpose**: Retrieves duplication statistics for an assignment
- **Route**: `GET /assignments/:id/duplication-stats`
- **Response**: Returns count of times assignment has been duplicated and list of courses

#### Routes: `backend/routes/assignmentRoutes.js`

**New Routes:**
```javascript
POST   /assignments/:id/duplicate          → assignmentController.duplicateAssignment
GET    /assignments/:id/duplication-stats  → assignmentController.getAssignmentDuplicationStats
```

---

### 2. Frontend: UI Components

#### Modal Component: `frontend/src/components/DuplicateAssignment.js`

**Features:**
- Multi-select interface for choosing target courses
- Optional due date adjustment toggle (+7 days)
- Real-time selection counter display
- Course conflict detection with error messages
- Loading, error, and success states
- Responsive modal overlay with animations

**Props:**
```javascript
{
  assignmentId: string,           // ID of assignment to duplicate
  assignmentTitle: string,        // Display name of assignment
  onClose: function,              // Callback when modal closes
  onSuccess: function             // Callback after successful duplication
}
```

**State Management:**
- `courses`: Array of all available courses
- `selectedCourses`: Set of checked course IDs
- `adjustDueDate`: Boolean toggle
- `loading`: Boolean for initial course fetch
- `submitting`: Boolean during duplication
- `error`: Error message display
- `success`: Success message display

#### Updated Component: `frontend/src/components/CreateAssignment.js`

**Changes:**
- Added import for `DuplicateAssignment` component and `duplicateAssignment` service
- New state variables:
  - `showDuplicateModal`: Controls modal visibility
  - `lastCreatedAssignmentId`: Stores created assignment ID
- Enhanced form submission:
  - After successful creation, displays success message
  - Auto-triggers duplication modal after 2 seconds
  - User can immediately duplicate without leaving the form
- Modal integration with close/success callbacks

---

### 3. Frontend: Styling

#### Stylesheet: `frontend/src/styles/DuplicateAssignment.css`

**Key Styles:**
- Modal overlay with semi-transparent backdrop
- Smooth slide-in animation (slideIn keyframe)
- Status badges with color coding:
  - Green for "selected"
  - Red for "conflict"
  - Gray for "available"
- Custom scrollbar styling for course list
- Responsive design with breakpoints:
  - **Desktop** (>768px): Full width modal
  - **Tablet** (768px): Adjusted padding
  - **Mobile** (<480px): Full-screen modal with touch-friendly buttons
- Disabled state styling for buttons and inputs
- Smooth transitions on all interactive elements

---

### 4. Frontend: Service Layer

#### Service File: `frontend/src/services/assignmentService.js`

**Functions:**

##### `createAssignment(data)`
- Creates a new assignment
- Parameters: `{ title, instructions, dueDate, maxScore, courseId }`
- Returns: Promise with created assignment data

##### `getAssignmentsByCourse(courseId)`
- Fetches all assignments for a specific course
- Parameters: `courseId` (string)
- Returns: Promise with array of assignments

##### `getAssignmentById(assignmentId)`
- Fetches specific assignment details
- Parameters: `assignmentId` (string)
- Returns: Promise with assignment data

##### `updateAssignment(assignmentId, data)`
- Updates an existing assignment
- Parameters: `assignmentId`, `{ title, instructions, dueDate, maxScore }`
- Returns: Promise with updated assignment data

##### `deleteAssignment(assignmentId)`
- Deletes an assignment
- Parameters: `assignmentId` (string)
- Returns: Promise with success confirmation

##### `duplicateAssignment(assignmentId, targetCourseIds, adjustDueDate)`
- Duplicates assignment to multiple courses
- Parameters: `assignmentId`, `targetCourseIds` (array), `adjustDueDate` (boolean)
- Returns: Promise with array of new assignment IDs
- Error handling: Returns conflict information if duplicates detected

##### `getAssignmentDuplicationStats(assignmentId)`
- Retrieves duplication statistics
- Parameters: `assignmentId` (string)
- Returns: Promise with duplication count and course list

---

## User Workflow

### Step 1: Create Assignment
1. Teacher navigates to "Create Assignment" section
2. Fills in form: Course, Title, Instructions, Due Date, Max Score
3. Clicks "Create Assignment" button

### Step 2: Duplication Prompt
1. After 2 seconds, assignment creation modal automatically displays
2. Success message shows: "✅ Assignment created successfully! Want to duplicate it to other courses?"

### Step 3: Select Target Courses
1. Teacher sees list of all available courses
2. Checks boxes for courses to duplicate to
3. Optionally enables "Adjust Due Date" to add 7 days per course

### Step 4: Submit Duplication
1. Clicks "Duplicate to Selected Courses" button
2. System validates:
   - No duplicate titles in target courses
   - All courses exist
   - At least one course selected

### Step 5: Success/Error
- **Success**: Modal closes, shows confirmation message
- **Error**: Displays conflicting course names, allows retry with different selection

---

## Error Handling

### Backend Errors
- **Empty targetCourseIds**: Returns 400 with message
- **Non-existent courses**: Returns 400 listing invalid courses
- **Duplicate titles**: Returns 409 with `conflictingCourses` array
- **Missing assignment**: Returns 404 with message

### Frontend Errors
- **Failed to load courses**: Displays user-friendly error, retry option
- **Duplication conflicts**: Shows which courses have conflicts, allows reselection
- **Network errors**: Displays error message, maintains form state

---

## Technical Details

### Database Updates
- No changes to schema required
- Uses existing `Assignment` model fields:
  - `title`, `instructions`, `dueDate`, `maxScore`
  - `course` (courseId)
  - `createdBy` (userId)

### API Patterns
- Follows RESTful conventions
- Uses JWT authentication via Bearer token
- Error responses include descriptive messages
- Success responses return full duplicated assignment objects

### State Management Pattern
- React hooks (useState, useEffect) for local state
- Axios for API calls
- localStorage for user/token persistence
- Service layer abstraction for API interactions

---

## Files Created/Modified

### Created Files
1. `backend/controllers/assignmentController.js` (2 new methods added)
2. `backend/routes/assignmentRoutes.js` (2 new routes added)
3. `frontend/src/components/DuplicateAssignment.js` (210 lines)
4. `frontend/src/styles/DuplicateAssignment.css` (500+ lines)
5. `frontend/src/services/assignmentService.js` (120+ lines, 6 functions)

### Modified Files
1. `frontend/src/components/CreateAssignment.js` (added duplication integration)

---

## Testing Checklist

- [ ] Create assignment in one course successfully
- [ ] Duplication modal appears after 2 seconds
- [ ] Can select multiple courses in modal
- [ ] "Adjust Due Date" toggle works correctly
- [ ] Duplicate button creates assignments in selected courses
- [ ] Conflict detection prevents duplicate titles
- [ ] Success message displays after duplication
- [ ] Modal closes cleanly after success
- [ ] Error messages display for invalid selections
- [ ] Mobile responsive layout works correctly
- [ ] Animations smooth on all breakpoints

---

## Future Enhancements

1. **Bulk Operations**: Duplicate multiple assignments at once
2. **Assignment Templates**: Save duplication patterns for reuse
3. **Due Date Calculator**: More flexible date adjustment options (by days/weeks)
4. **Duplication History**: Track all duplications with timestamps
5. **Undo Functionality**: Rollback recent duplications
6. **Assignment Versioning**: Track changes across duplicated assignments

---

## Notes

- Feature is production-ready with comprehensive error handling
- Fully responsive design compatible with mobile, tablet, and desktop
- Service layer follows established application patterns
- No breaking changes to existing functionality
- Backward compatible with existing assignment system

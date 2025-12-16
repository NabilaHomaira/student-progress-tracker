import './App.css';

import EnrollmentStats from './components/EnrollmentStats';
import CourseSelector from './components/CourseSelector';
import SubmissionStats from './components/SubmissionStats';
import TrendAnalysis from './components/TrendAnalysis';
import StudentProgress from './components/StudentProgress';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Progress Tracker</h1>

      <hr />

      <h2>Requirement 1 → Feature 3 (Enrollment Stats)</h2>
      <EnrollmentStats />

      <hr />

      <h2>Requirement 2 → Feature 1 (Submission Stats)</h2>
      <CourseSelector />
      <SubmissionStats />

      <hr />

      <h2>Requirement 3 → Feature 4 (Trend Analysis)</h2>
      <TrendAnalysis />

      <hr />

      <h2>Requirement 4 → Feature 3 (Student Progress)</h2>
      <StudentProgress />

      <hr />

      <h2>Requirement 5 → Feature 1</h2>
      <p>(UI goes here)</p>
    </div>
  );
}

export default App;


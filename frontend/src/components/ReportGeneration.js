import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ReportGeneration.css';

export default function ReportGeneration() {
  const [reportType, setReportType] = useState('student'); // 'student' or 'course'
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [format, setFormat] = useState('csv'); // 'csv' or 'pdf'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);
  const [courseData, setCourseData] = useState(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load students when selected course changes (for student report)
  useEffect(() => {
    if (reportType === 'student' && selectedCourse) {
      loadStudents();
    }
  }, [selectedCourse, reportType]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      // Get enrolled students for the course
      const response = await api.get(`/enrollments/course/${selectedCourse}`);
      const enrolledStudentsData = response.data || [];
      console.log('Enrolled students loaded:', enrolledStudentsData);

      // Format the students data
      const formattedStudents = enrolledStudentsData.map((student) => ({
        _id: student._id,
        name: student.name || 'Unknown Student',
        email: student.email || 'N/A'
      }));

      setStudents(formattedStudents);
      setLoading(false);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students for this course');
      setStudents([]);
      setLoading(false);
    }
  };

  const validateReportInputs = () => {
    if (reportType === 'student') {
      if (!selectedStudent) {
        setError('Please select a student');
        return false;
      }
    } else {
      if (!selectedCourse) {
        setError('Please select a course');
        return false;
      }
    }
    return true;
  };

  const handleGenerateReport = async () => {
    if (!validateReportInputs()) {
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccess('');

      let endpoint = '';
      let filename = '';

      if (reportType === 'student') {
        endpoint = `/reports/student/${selectedStudent}/format/${format}`;
        filename = `student_report_${selectedStudent}.${format === 'pdf' ? 'txt' : 'csv'}`;
      } else {
        endpoint = `/reports/course/${selectedCourse}/format/${format}`;
        filename = `course_report_${selectedCourse}.${format === 'pdf' ? 'txt' : 'csv'}`;
      }

      const response = await api.get(endpoint, {
        responseType: format === 'pdf' ? 'arraybuffer' : 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv; charset=utf-8' : 'text/plain; charset=utf-8',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);

      setSuccess(
        `Report generated and downloaded successfully as ${filename}`
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePreviewReport = async () => {
    if (!validateReportInputs()) {
      return;
    }

    try {
      setGenerating(true);
      setError('');

      let endpoint = '';

      if (reportType === 'student') {
        endpoint = `/reports/student/${selectedStudent}/format/${format}`;
      } else {
        endpoint = `/reports/course/${selectedCourse}/format/${format}`;
      }

      const response = await api.get(endpoint);

      // For preview, just display the first part
      setCourseData({
        preview: typeof response.data === 'string' 
          ? response.data.split('\n').slice(0, 20).join('\n')
          : JSON.stringify(response.data, null, 2).split('\n').slice(0, 20).join('\n'),
        fullData: response.data,
      });

      setSuccess('Report preview loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report preview');
      console.error('Error loading report:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="report-generation">
      <h2>Generate Grade Reports</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="report-controls">
        <div className="control-group">
          <label htmlFor="report-type">Report Type:</label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedStudent('');
              setCourseData(null);
            }}
          >
            <option value="student">Per Student Report</option>
            <option value="course">Per Course Report</option>
          </select>
        </div>

        {reportType === 'course' && (
          <div className="control-group">
            <label htmlFor="course-select">Select Course:</label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCourseData(null);
              }}
              disabled={loading}
            >
              <option value="">-- Choose a course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'student' && (
          <>
            <div className="control-group">
              <label htmlFor="course-select-student">Select Course:</label>
              <select
                id="course-select-student"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedStudent('');
                  setCourseData(null);
                }}
                disabled={loading}
              >
                <option value="">-- Choose a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="control-group">
                <label htmlFor="student-select">Select Student:</label>
                {loading ? (
                  <div style={{padding: '10px', color: '#6b7280'}}>Loading students...</div>
                ) : students.length === 0 ? (
                  <div style={{padding: '10px', color: '#ef4444', fontWeight: '600'}}>
                    ❌ No enrolled students found for this course
                  </div>
                ) : (
                  <select
                    id="student-select"
                    value={selectedStudent}
                    onChange={(e) => {
                      setSelectedStudent(e.target.value);
                      setCourseData(null);
                    }}
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </>
        )}

        <div className="control-group">
          <label htmlFor="format-select">Report Format:</label>
          <select
            id="format-select"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              setCourseData(null);
            }}
          >
            <option value="csv">CSV (Spreadsheet)</option>
            <option value="pdf">PDF (Document)</option>
          </select>
        </div>
      </div>

      <div className="report-actions">
        <button
          onClick={handlePreviewReport}
          disabled={generating || !selectedStudent && reportType === 'student' || !selectedCourse && reportType === 'course'}
          className="btn btn-secondary"
        >
          {generating ? 'Loading...' : 'Preview Report'}
        </button>
        <button
          onClick={handleGenerateReport}
          disabled={generating || !selectedStudent && reportType === 'student' || !selectedCourse && reportType === 'course'}
          className="btn btn-primary"
        >
          {generating ? 'Generating...' : `Download as ${format.toUpperCase()}`}
        </button>
      </div>

      {courseData && (
        <div className="report-preview">
          <h3>Report Preview (First 20 lines)</h3>
          <pre className="preview-content">{courseData.preview}</pre>
          <p className="preview-note">This is a preview. Download the full report to see all data.</p>
        </div>
      )}

      <div className="report-info">
        <h3>Report Information</h3>
        <ul>
          <li><strong>CSV Format:</strong> Download as a spreadsheet file that can be opened in Excel or Google Sheets</li>
          <li><strong>PDF Format:</strong> Download as a formatted document for printing and sharing</li>
          <li><strong>Per Student Report:</strong> Shows grades across all assignments in a selected course</li>
          <li><strong>Per Course Report:</strong> Shows all students' grades for all assignments in a course</li>
        </ul>
      </div>
    </div>
  );
}

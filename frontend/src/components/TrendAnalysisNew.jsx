import React, { useState, useEffect } from 'react';
import { getTrendAnalysis } from '../services/statsService';
import api from '../services/api';
import { findStudentByName } from '../services/userService';
import '../styles/TrendAnalysis.css';

// Simple line chart implementation
const SimpleLineChart = ({ data, studentSeries, classSeries }) => {
  if (!studentSeries || !classSeries || studentSeries.length === 0) {
    return <p>No data available for chart</p>;
  }

  const maxScore = Math.max(
    ...studentSeries.map((s) => s.score || 0),
    ...classSeries.map((c) => c.score || 0)
  );

  // Guard against all-zero or non-numeric scores which would make maxScore 0
  // and cause divisions by zero when plotting. Use 1 as a safe minimum.
  const safeMaxScore = maxScore > 0 ? maxScore : 1;

  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 40;

  // Calculate points for SVG path
  const plotWidth = chartWidth - 2 * padding;
  const plotHeight = chartHeight - 2 * padding;

  const studentPoints = studentSeries.map((s, idx) => ({
    x: padding + (idx * plotWidth) / (studentSeries.length - 1 || 1),
    y: chartHeight - padding - ((s.score || 0) / safeMaxScore) * plotHeight,
  }));

  const classPoints = classSeries.map((c, idx) => ({
    x: padding + (idx * plotWidth) / (classSeries.length - 1 || 1),
    y: chartHeight - padding - ((c.score || 0) / safeMaxScore) * plotHeight,
  }));

  const studentPathD = studentPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const classPathD = classPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="chart-container">
      <svg width={chartWidth} height={chartHeight} className="trend-chart">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-h-${i}`}
            x1={padding}
            y1={padding + (i * plotHeight) / 4}
            x2={chartWidth - padding}
            y2={padding + (i * plotHeight) / 4}
            stroke="#e0e0e0"
            strokeDasharray="4"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#000"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#000"
          strokeWidth="2"
        />

        {/* Student line */}
        <path
          d={studentPathD}
          stroke="#3498db"
          strokeWidth="2"
          fill="none"
        />

        {/* Class line */}
        <path
          d={classPathD}
          stroke="#e74c3c"
          strokeWidth="2"
          fill="none"
        />

        {/* Student points */}
        {studentPoints.map((p, i) => (
          <circle
            key={`student-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#3498db"
          />
        ))}

        {/* Class points */}
        {classPoints.map((p, i) => (
          <circle
            key={`class-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#e74c3c"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={`y-label-${i}`}
            x={padding - 10}
            y={padding + (i * plotHeight) / 4 + 5}
            textAnchor="end"
            fontSize="12"
          >
            {Math.round((safeMaxScore * (4 - i)) / 4)}
          </text>
        ))}

        {/* X-axis labels */}
        {studentSeries.map((s, i) => (
          <text
            key={`x-label-${i}`}
            x={padding + (i * plotWidth) / (studentSeries.length - 1 || 1)}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            fontSize="12"
          >
            {s.term || `T${i + 1}`}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color student-color"></span>
          <span>Student Average</span>
        </div>
        <div className="legend-item">
          <span className="legend-color class-color"></span>
          <span>Class Average</span>
        </div>
      </div>
    </div>
  );
};

export default function TrendAnalysis() {
  const [studentName, setStudentName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const load = async () => {
    if (!studentName.trim() && !courseId.trim()) {
      setErr('Enter student name or select a course for trend analysis');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      let res;
      if (studentName.trim()) {
        // resolve name -> id
        const sid = await findStudentByName(studentName.trim());
        if (!sid) throw new Error('Student not found for that name');
        res = await getTrendAnalysis(sid);
      } else {
        // Load class trend data for a course
        const submissionsResponse = await api.get(
          `/submissions/course/${courseId}`
        );
        const submissions = submissionsResponse.data || [];

        // Calculate class average trends
        const termAverages = {};
        submissions.forEach((sub) => {
          const term = sub.submittedAt
            ? new Date(sub.submittedAt).getMonth() + 1
            : 1;
          const termKey = `Term ${term}`;
          if (!termAverages[termKey]) {
            termAverages[termKey] = { total: 0, count: 0 };
          }
          if (sub.score) {
            termAverages[termKey].total += sub.score;
            termAverages[termKey].count += 1;
          }
        });

        res = {
          studentSeries: Object.keys(termAverages).map((term) => ({
            term,
            score:
              termAverages[term].count > 0
                ? termAverages[term].total / termAverages[term].count
                : 0,
          })),
          classSeries: Object.keys(termAverages).map((term) => ({
            term,
            score:
              termAverages[term].count > 0
                ? termAverages[term].total / termAverages[term].count
                : 0,
          })),
        };
      }
      setData(res);
    } catch (e) {
      setErr(
        e?.response?.data?.message || e.message || 'Failed to load trend data'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trend-analysis">
      <h2>Trend Analysis - Student vs Class Performance</h2>

      <div className="trend-controls">
        <div className="input-group">
          <label htmlFor="student-input">Student Name (optional):</label>
          <input
            id="student-input"
            placeholder="Enter student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="course-select">Or Select Course:</label>
          <select
            id="course-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.code})
              </option>
            ))}
          </select>
        </div>

        <button onClick={load} disabled={loading} className="btn btn-primary">
          {loading ? 'Loading...' : 'Load Trend Analysis'}
        </button>
      </div>

      {loading && <p className="loading">Loading trend analysis...</p>}
      {err && <p className="error">{err}</p>}

      {!loading && !err && data && (
        <div className="trend-results">
          <SimpleLineChart
            data={data}
            studentSeries={data.studentSeries}
            classSeries={data.classSeries}
          />

          <table className="trend-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Student Average</th>
                <th>Class Average</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {(data.studentSeries || []).map((s, idx) => {
                const c = (data.classSeries || [])[idx];
                const diff = (s.score || 0) - (c?.score || 0);
                return (
                  <tr key={idx}>
                    <td>{s.term || `Term ${idx + 1}`}</td>
                    <td>{(s.score || 0).toFixed(2)}</td>
                    <td>{(c?.score || 0).toFixed(2)}</td>
                    <td className={diff >= 0 ? 'positive' : 'negative'}>
                      {diff >= 0 ? '+' : ''}
                      {diff.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="trend-insights">
            <h3>Performance Insights</h3>
            {(() => {
              const studentScores = (data.studentSeries || []).map(
                (s) => s.score || 0
              );
              const avgStudent =
                studentScores.length > 0
                  ? studentScores.reduce((a, b) => a + b) / studentScores.length
                  : 0;

              const classScores = (data.classSeries || []).map(
                (c) => c.score || 0
              );
              const avgClass =
                classScores.length > 0
                  ? classScores.reduce((a, b) => a + b) / classScores.length
                  : 0;

              return (
                <>
                  <p>
                    <strong>Overall Student Average:</strong> {avgStudent.toFixed(2)}
                  </p>
                  <p>
                    <strong>Overall Class Average:</strong> {avgClass.toFixed(2)}
                  </p>
                  {avgStudent > avgClass && (
                    <p className="insight-positive">
                      ✓ This student is performing above class average!
                    </p>
                  )}
                  {avgStudent < avgClass && (
                    <p className="insight-negative">
                      ⚠ This student is performing below class average.
                    </p>
                  )}
                  {avgStudent === avgClass && (
                    <p className="insight-neutral">
                      → This student is at the class average.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

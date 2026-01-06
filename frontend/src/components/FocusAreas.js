import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/FocusAreas.css';

export default function FocusAreas(){
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(()=>{ load(); }, []);

  const load = async ()=>{
    setLoading(true); setError(null);
    try{
      const res = await api.get('/student/focus-areas');
      const data = res.data || res;
      setCourses(data.coursesNeedingFocus || []);
      setAssignments(data.assignmentsNeedingFocus || []);
    }catch(e){
      const msg = e?.response?.data?.message || e.message || 'Failed to load focus areas';
      setError(msg);
    }finally{ setLoading(false); }
  };

  return (
    <div className="focus-areas card">
      <div className="card-header">
        <h3>Suggested Focus Areas</h3>
      </div>

      {loading && <p className="muted">Loading suggestions…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="fa-grid">
          <section className="fa-column">
            <h4>Courses Needing Attention</h4>
            {courses.length === 0 ? (
              <p className="muted">No courses need focused attention right now.</p>
            ) : (
              <ul className="course-list">
                {courses.map(c => (
                  <li key={c.courseId} className="course-item">
                    <div className="course-left">
                      <div className="course-title">{c.title}</div>
                      <div className="course-meta">{c.code || c.courseId}</div>
                    </div>
                    <div className="course-right">
                      <span className="badge danger">{c.belowCount}</span>
                      <div className="small muted">Below average</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="fa-column">
            <h4>Assignments to Revisit</h4>
            {assignments.length === 0 ? (
              <p className="muted">No assignments identified.</p>
            ) : (
              <ul className="assignment-list">
                {assignments.map(a => (
                  <li key={a.assignmentId} className="assignment-item">
                    <div className="assign-left">
                      <div className="assign-title">{a.assignmentTitle}</div>
                      <div className="assign-course muted">{a.course?.code || a.course?.title}</div>
                    </div>
                    <div className="assign-right">
                      <div className="scores">{a.studentScore} / {a.assignmentMax || a.maxScore || '—'}</div>
                      <div className="class-avg muted">Avg: {a.classAverage ?? '—'}</div>
                    </div>
                    <div className="assign-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${Math.min(100, Math.round((a.studentScore||0) / (a.assignmentMax||a.maxScore||100) * 100))}%`}} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

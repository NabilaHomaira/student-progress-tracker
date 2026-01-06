import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import GradeManagement from './GradeManagement';
import FeedbackManagement from './FeedbackManagement';
import ReportGeneration from './ReportGeneration';
import TrendAnalysis from './TrendAnalysisNew';

export default function InstructorDashboard(){
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('enrollments'); // 'enrollments', 'grades', 'feedback', 'reports', 'trends'
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      setLoading(true);
      try{
        const res = await api.get('/enrollments/courses/my-requests');
        if(!mounted) return;
        setRequests(res.data || []);
      }catch(e){ 
        console.error('Error loading requests:', e);
        setError(e.response?.data?.message || 'Failed to load');
        setRequests([]);
      }
      setLoading(false);
    };
    load();
    return ()=> mounted=false;
  },[]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data || []);
        if (response.data && response.data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    };
    loadCourses();
  }, []);

  const [confirmState, setConfirmState] = useState({ open:false, message:'', action:null });

  const approve = async (id)=>{
    const doApprove = async ()=>{
      try{ await api.patch(`/enrollments/enrollment-requests/${id}/approve`); setRequests(r=>r.filter(x=>x._id!==id)); }
      catch(e){ setError(e.response?.data?.message || 'Approve failed'); }
      setConfirmState({ open:false, message:'', action:null });
    };
    setConfirmState({ open:true, message:'Approve request?', action: doApprove });
  };

  const reject = async (id)=>{
    const doReject = async ()=>{
      try{ await api.patch(`/enrollments/enrollment-requests/${id}/reject`); setRequests(r=>r.filter(x=>x._id!==id)); }
      catch(e){ setError(e.response?.data?.message || 'Reject failed'); }
      setConfirmState({ open:false, message:'', action:null });
    };
    setConfirmState({ open:true, message:'Reject request?', action: doReject });
  };

  return (
    <div style={{maxWidth:1200,margin:'1.5rem auto', padding: '0 15px'}}>
      <h2>Instructor Dashboard</h2>
      
      {/* Course selector will appear inside each tab's content, below the sections (moved) */}
      
      {/* Tabs Navigation */}
      <div style={{display:'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setActiveTab('enrollments')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'enrollments' ? '#3498db' : '#f0f0f0',
            color: activeTab === 'enrollments' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'enrollments' ? '600' : '400'
          }}
        >
          Enrollment Requests
        </button>
        <button 
          onClick={() => setActiveTab('grades')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'grades' ? '#3498db' : '#f0f0f0',
            color: activeTab === 'grades' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'grades' ? '600' : '400'
          }}
        >
          Grade Management
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'feedback' ? '#3498db' : '#f0f0f0',
            color: activeTab === 'feedback' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'feedback' ? '600' : '400'
          }}
        >
          Feedback & Tips
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'reports' ? '#3498db' : '#f0f0f0',
            color: activeTab === 'reports' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'reports' ? '600' : '400'
          }}
        >
          Generate Reports
        </button>
        <button 
          onClick={() => setActiveTab('trends')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'trends' ? '#3498db' : '#f0f0f0',
            color: activeTab === 'trends' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'trends' ? '600' : '400'
          }}
        >
          Trend Analysis
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'enrollments' && (
        <div style={{maxWidth:980}}>
          <h3>Enrollment Requests</h3>
          {loading ? <div style={{color:'#6b7280'}}>Loading...</div> : (
            <div>
              {error && <div style={{color:'red'}}>{error}</div>}
              {requests.length===0 ? <div style={{color:'#6b7280'}}>No pending requests</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {requests.map(r => (
                    <div key={r._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:700}}>{r.student?.name} — {r.course?.title}</div>
                        <div style={{color:'#6b7280'}}>{r.student?.email}</div>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" style={{background:'#10b981',color:'#fff'}} onClick={()=>approve(r._id)}>Approve</button>
                        <button className="btn" style={{background:'#ef4444',color:'#fff'}} onClick={()=>reject(r._id)}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div>
          {courses.length > 0 && (
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151'}}>Select Course:</label>
              <select value={selectedCourseId} onChange={(e)=>setSelectedCourseId(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:6, border:'1px solid #d1d5db'}}>
                <option value="">-- Select a course --</option>
                {courses.map(course => (<option key={course._id} value={course._id}>{course.title} ({course.code})</option>))}
              </select>
            </div>
          )}
          <GradeManagement courseId={selectedCourseId} />
        </div>
      )}

      {activeTab === 'feedback' && (
        <div>
          {courses.length > 0 && (
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151'}}>Select Course:</label>
              <select value={selectedCourseId} onChange={(e)=>setSelectedCourseId(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:6, border:'1px solid #d1d5db'}}>
                <option value="">-- Select a course --</option>
                {courses.map(course => (<option key={course._id} value={course._id}>{course.title} ({course.code})</option>))}
              </select>
            </div>
          )}
          <FeedbackManagement courseId={selectedCourseId} />
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <ReportGeneration />
        </div>
      )}

      {activeTab === 'trends' && (
        <div>
          {courses.length > 0 && (
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151'}}>Select Course:</label>
              <select value={selectedCourseId} onChange={(e)=>setSelectedCourseId(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:6, border:'1px solid #d1d5db'}}>
                <option value="">-- Select a course --</option>
                {courses.map(course => (<option key={course._id} value={course._id}>{course.title} ({course.code})</option>))}
              </select>
            </div>
          )}
          <TrendAnalysis />
        </div>
      )}

      <ConfirmModal 
        open={confirmState.open} 
        message={confirmState.message} 
        onCancel={()=>setConfirmState({ open:false, message:'', action:null })} 
        onConfirm={()=>{ confirmState.action && confirmState.action(); }} 
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Toaster from './Toaster';

export default function CourseCard({ course, onChanged }){
  const [loading,setLoading]=useState(false);
  const [showAssistants,setShowAssistants]=useState(false);
  const [showStats,setShowStats]=useState(false);
  const [showRequests,setShowRequests]=useState(false);
  const { user } = React.useContext(AuthContext);
  const [message,setMessage]=useState('');
  const [usersMap,setUsersMap]=useState({});
  const [allUsers,setAllUsers]=useState([]);

  useEffect(()=>{
    let mounted=true;
    api.get('/users').then(res=>{
      if(!mounted) return;
      const map = {};
      const list = res.data.users || [];
      list.forEach(u=>{ map[u._id]=u; map[u.email]=u; });
      setUsersMap(map);
      setAllUsers(list);
    }).catch(e=>console.error(e));
    // load student's pending enrollment requests to mark pending courses
    if(user?.role === 'student'){
      api.get('/enrollments/students/my-enrollment-requests').then(res=>{
        if(!mounted) return;
        const pending = res.data || [];
        const map = {};
        // only mark requests that are still pending
        pending.forEach(r => { if(r.status === 'pending' && r.course) map[String(r.course._id || r.course)] = true; });
        setPendingMap(map);
      }).catch(()=>{});
    }
    return ()=> mounted=false;
  },[]);

  // If the course shows the student as enrolled, clear any pending flag for it
  useEffect(()=>{
    if(user?.role === 'student'){
      const isEnrolled = (course.enrolledStudents || []).some(id => String(id) === user._id || String(id) === user.id);
      if(isEnrolled){ setPendingMap(prev => { const copy = { ...prev }; delete copy[String(course._id)]; return copy; }); }
    }
  },[course.enrolledStudents, course._id, user]);

  const [pendingMap,setPendingMap]=useState({});
  const [confirmState,setConfirmState]=useState({ open:false, message:'', onConfirm:null });

  const askConfirm = (message, cb) => {
    setConfirmState({ open:true, message, onConfirm: ()=>{ try{ cb(); } finally { setConfirmState({ open:false, message:'', onConfirm:null }); } } });
  };

  const toggleArchive = async ()=>{
    setLoading(true);
    try{
      await api.patch(`/courses/${course._id}/archive-toggle`);
      onChanged();
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  const enroll = async ()=>{
    setMessage('');
    if(course.archived){ setMessage('Cannot enroll in an archived course'); return; }
    if(user?.role !== 'student'){ setMessage('Only students can enroll'); return; }
    // Enroll action submits an enrollment request; instructor approval required
    setLoading(true);
    try{
      const res = await api.post(`/enrollments/courses/${course._id}/request-enrollment`);
      setMessage('Enrollment request submitted; awaiting instructor approval');
      // mark pending locally
      setPendingMap(prev => ({ ...prev, [String(course._id)]: true }));
      if(res?.data?.request) onChanged();
    }catch(e){
      setMessage(e.response?.data?.message || 'Request failed');
      console.error(e);
    }
    setLoading(false);
  };

  const requestEnrollment = async ()=>{
    // alias to the same action
    return enroll();
  };

  const unenroll = async ()=>{
    setMessage('');
    setLoading(true);
    try{
      await api.post(`/enrollments/courses/${course._id}/unenroll`, {});
      setMessage('Unenrolled successfully');
      // clear pending flag for this course (if any)
      setPendingMap(prev => { const copy = { ...prev }; delete copy[String(course._id)]; return copy; });
      if(onChanged) onChanged();
    }catch(e){ setMessage(e.response?.data?.message || 'Unenroll failed'); console.error(e); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 style={{margin:'0 0 6px 0'}}>{course.title}</h3>
      <div style={{color:'#6b7280',marginBottom:8}}>{course.code} • Instructor: {course.instructor?.name || '—'}</div>
      {(() => {
        const assistantNames = (course.assistantIds || []).map(id => {
          const u = usersMap[id];
          return u ? `${u.name} (${u.email})` : id;
        });
        return assistantNames.length>0 ? (
          <div style={{color:'#374151',marginBottom:8,fontSize:13}}>Assistants: {assistantNames.join(', ')}</div>
        ) : null;
      })()}
      <p style={{minHeight:48,marginBottom:12}}>{course.description}</p>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div style={{color:'#6b7280',fontSize:13}}>Enrolled: <strong style={{color:'#0f172a'}}>{course.enrolledCount}</strong> / {course.capacity || '—'}</div>
        <div style={{display:'flex',gap:8}}>
          {/* Hide Stats button entirely for students */}
          {user?.role !== 'student' && (
            <button onClick={()=>setShowStats(true)} className="btn">Stats</button>
          )}
          {/* Student enrollment actions */}
          {user?.role === 'student' && (
            (() => {
              const isEnrolled = (course.enrolledStudents || []).some(id => id === user._id || id === user.id);
              if (isEnrolled) {
                return <button onClick={unenroll} className="btn" style={{background:'#ef4444',color:'#fff'}} disabled={loading}>Unenroll</button>;
              }
              // show pending indicator if there's a pending request
              if (pendingMap[course._id]) {
                return <button className="btn" disabled style={{opacity:0.7}}>Request Pending</button>;
              }
              // show enroll or request depending on seatsAvailable
              if ((course.seatsAvailable || 0) > 0) {
                return <button onClick={enroll} className="btn" style={{background:'#10b981',color:'#fff'}} disabled={loading}>Request Enrollment</button>;
              }
              return <button onClick={requestEnrollment} className="btn" disabled={loading}>Request Enrollment</button>;
            })()
          )}
          {/* Show assistants management only to the instructor who created the course */}
          {user && course.instructor && user._id === course.instructor._id && (
            <>
              <button onClick={()=>setShowAssistants(true)} className="btn">Assistants</button>
              <button onClick={()=>setShowRequests(true)} className="btn">Enrollment Requests</button>
            </>
          )}
          {/* Archive/reactivate allowed only for the course instructor or admins */}
          {(user && (user._id === course.instructor?._id || user.role === 'admin')) && (
            <button onClick={toggleArchive} className="btn" style={{background:course.archived ? '#059669' : '#ef4444',color:'#fff'}} disabled={loading}>{course.archived? 'Reactivate':'Archive'}</button>
          )}
        </div>
      </div>
      {message && <div style={{marginTop:8,color: (message || '').toLowerCase().includes('failed') || (message || '').toLowerCase().includes('cannot') ? 'red' : '#059669'}}>{message}</div>}

      {showAssistants && <AssistantsModal course={course} onClose={()=>{ setShowAssistants(false); onChanged(); }} usersMap={usersMap} allUsers={allUsers} />}
      {showStats && <StatsModal courseId={course._id} onClose={()=>setShowStats(false)} />}
      {showRequests && <PendingRequestsModal course={course} onClose={()=>{ setShowRequests(false); onChanged(); }} onChanged={onChanged} askConfirm={askConfirm} />}

      {confirmState.open && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1400}}>
          <div style={{background:'#fff',padding:20,borderRadius:8,minWidth:320}}>
            <div style={{marginBottom:12}}>{confirmState.message}</div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button className="btn" onClick={()=>setConfirmState({ open:false, message:'', onConfirm:null })}>Cancel</button>
              <button className="btn" style={{background:'#10b981',color:'#fff'}} onClick={()=>{ confirmState.onConfirm && confirmState.onConfirm(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <Toaster message={message} type={(message||'').toLowerCase().includes('failed') ? 'error' : 'info'} onClose={()=>setMessage('')} />
    </div>
  );
}

function AssistantsModal({ course, onClose, usersMap, allUsers }){
  const [assistants,setAssistants]=useState(course.assistantIds || []);
  const [newEmail,setNewEmail]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const { user } = React.useContext(AuthContext);

  const [query,setQuery]=useState('');
  const [suggestions,setSuggestions]=useState([]);

  useEffect(()=>{
    if(!query) return setSuggestions([]);
    const q = query.toLowerCase();
    const matches = (allUsers||[]).filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
    setSuggestions(matches.slice(0,8));
  },[query, allUsers]);

  const addByEmail = async (userToAdd)=>{
    setError('');
    // Only the instructor who created the course may add assistants
    if(!(user && course.instructor && user._id === course.instructor._id)){
      return setError('Only the course instructor may add assistants');
    }
    const target = userToAdd || Object.values(usersMap).find(u => u.email.toLowerCase() === newEmail.toLowerCase());
    if(!target) return setError('Select or enter a valid user');
    setLoading(true);
    try{
      await api.post(`/courses/${course._id}/assistants`, { assistantId: target._id });
      setAssistants(prev=>[...prev, target._id]);
      setNewEmail(''); setQuery(''); setSuggestions([]);
    }catch(e){ console.error(e); setError(e.response?.data?.message || 'Add failed'); }
    setLoading(false);
  };

  const remove = async (id)=>{
    setLoading(true);
    try{ await api.delete(`/courses/${course._id}/assistants/${id}`); setAssistants(assistants.filter(a=>a!==id)); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  const displayAssistant = (id)=>{
    const u = usersMap[id];
    if(u) return `${u.name} <${u.email}>`;
    return id;
  };

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1200}}>
      <div style={{background:'#fff',padding:20,borderRadius:12,minWidth:380,boxShadow:'0 12px 30px rgba(0,0,0,0.18)',zIndex:1300}}>
        <h3 style={{marginTop:0}}>Manage Assistants</h3>
        <div style={{marginBottom:8}}>
          <label>New assistant email</label>
          <input value={newEmail} onChange={e=>{ setNewEmail(e.target.value); setQuery(e.target.value); }} placeholder="search by name or email" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #e5e7eb'}} />
          {suggestions.length>0 && (
            <div style={{border:'1px solid #e5e7eb',borderRadius:8,background:'#fff',maxHeight:200,overflow:'auto',marginTop:8}}>
              {suggestions.map(s => (
                <div key={s._id} onClick={()=>{ setNewEmail(s.email); setQuery(''); setSuggestions([]); addByEmail(s); }} style={{padding:8,cursor:'pointer',borderBottom:'1px solid #f1f5f9'}}>
                  <div style={{fontWeight:600}}>{s.name}</div>
                  <div style={{color:'#6b7280',fontSize:13}}>{s.email}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
            <button onClick={()=>addByEmail()} className="btn" style={{padding:'8px 12px',background:'#4f46e5',color:'#fff'}} disabled={loading}>Add</button>
          </div>
          {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
        </div>
        <div>
          <h4 style={{marginBottom:6}}>Current assistants</h4>
          <ul style={{paddingLeft:18}}>
            {assistants.length===0 && <li style={{color:'#6b7280'}}>No assistants</li>}
            {assistants.map(a => (
              <li key={a} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}>
                <span>{displayAssistant(a)}</span>
                <button onClick={()=>remove(a)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8}}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
}

function PendingRequestsModal({ course, onClose, onChanged, askConfirm }){
  const [requests,setRequests]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    let mounted=true;
    const load = async ()=>{
      setLoading(true);
      try{
        const res = await api.get(`/enrollments/courses/${course._id}/enrollment-requests`);
        if(!mounted) return;
        setRequests(res.data || []);
      }catch(e){ console.error(e); setError(e.response?.data?.message || 'Failed to load requests'); }
      setLoading(false);
    };
    load();
    return ()=> mounted=false;
  },[course._id]);

  const approve = async (reqId)=>{
    const doApprove = async ()=>{
      try{
        await api.patch(`/enrollments/enrollment-requests/${reqId}/approve`);
        setRequests(prev=>prev.filter(r=>r._id!==reqId));
        if(onChanged) onChanged();
      }catch(e){ console.error(e); setError(e.response?.data?.message || 'Approve failed'); }
    };

    if(typeof askConfirm === 'function'){
      askConfirm('Approve this enrollment request?', doApprove);
    } else {
      if(!window.confirm('Approve this enrollment request?')) return;
      await doApprove();
    }
  };

  const reject = async (reqId)=>{
    const doReject = async ()=>{
      try{
        await api.patch(`/enrollments/enrollment-requests/${reqId}/reject`);
        setRequests(prev=>prev.filter(r=>r._id!==reqId));
        if(onChanged) onChanged();
      }catch(e){ console.error(e); setError(e.response?.data?.message || 'Reject failed'); }
    };

    if(typeof askConfirm === 'function'){
      askConfirm('Reject this enrollment request?', doReject);
    } else {
      if(!window.confirm('Reject this enrollment request?')) return;
      await doReject();
    }
  };

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1200}}>
      <div style={{background:'#fff',padding:20,borderRadius:12,minWidth:420,boxShadow:'0 12px 30px rgba(0,0,0,0.18)',zIndex:1300}}>
        <h3 style={{marginTop:0}}>Enrollment Requests</h3>
        {loading ? <div>Loading...</div> : (
          <div>
            {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
            {requests.length===0 && <div style={{color:'#6b7280'}}>No pending requests</div>}
            <ul style={{paddingLeft:18}}>
              {requests.map(r => (
                <li key={r._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f3f4f6'}}>
                  <div>
                    <div style={{fontWeight:600}}>{r.student?.name || 'Unknown'}</div>
                    <div style={{color:'#6b7280',fontSize:13}}>{r.student?.email || ''}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>approve(r._id)} className="btn" style={{background:'#10b981',color:'#fff'}}>Approve</button>
                    <button onClick={()=>reject(r._id)} className="btn" style={{background:'#ef4444',color:'#fff'}}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
}

function StatsModal({ courseId, onClose }){
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const { user } = React.useContext(AuthContext);

  React.useEffect(()=>{
    let mounted=true;
    api.get(`/courses/${courseId}/stats`).then(res=>{ if(mounted) setStats(res.data); }).catch(e=>console.error(e)).finally(()=>{ if(mounted) setLoading(false); });
    return ()=> mounted=false;
  },[courseId]);

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1200}}>
      <div style={{background:'#fff',padding:20,borderRadius:8,minWidth:320,zIndex:1300}}>
        <h3>Enrollment Statistics</h3>
        {loading ? <div>Loading...</div> : (
          <div>
            <div><strong>Total enrolled:</strong> {stats?.totalEnrolledStudents ?? 0}</div>
            {user?.role !== 'student' && (
              <div><strong>Average performance:</strong> {stats?.averagePerformance ?? 0}</div>
            )}
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
}

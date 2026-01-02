import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';


export default function InstructorDashboard(){
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      setLoading(true);
      try{
        const res = await api.get('/enrollments/courses/my-requests');
        if(!mounted) return;
        setRequests(res.data || []);
      }catch(e){ console.error(e); setError(e.response?.data?.message || 'Failed to load'); }
      setLoading(false);
    };
    load();
    return ()=> mounted=false;
  },[]);

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
    <div style={{maxWidth:980,margin:'1.5rem auto'}}>
      <h2>Instructor Dashboard — Enrollment Requests</h2>
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
      <ConfirmModal open={confirmState.open} message={confirmState.message} onCancel={()=>setConfirmState({ open:false, message:'', action:null })} onConfirm={()=>{ confirmState.action && confirmState.action(); }} />
    </div>
  );
}

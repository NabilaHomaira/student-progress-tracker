import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function EnrollmentHistory(){
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      setLoading(true);
      try{
        const res = await api.get('/enrollments/history');
        if(!mounted) return;
        setHistory(res.data || []);
      }catch(e){ console.error(e); }
      setLoading(false);
    };
    load();
    return ()=> mounted = false;
  },[]);

  return (
    <div style={{maxWidth:900,margin:'1.5rem auto'}}>
      <h2>Enrollment History</h2>
      {loading ? <div style={{color:'#6b7280'}}>Loading...</div> : (
        history.length === 0 ? (
          <div style={{color:'#6b7280'}}>No enrollment history available</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {history.map((h, idx) => (
              <div key={idx} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',flexDirection:'column'}}>
                  <div style={{fontWeight:700}}>{h.course?.title || 'Unknown course'}</div>
                  <div style={{color:'#6b7280'}}>{h.course?.code || ''} • {h.status}</div>
                </div>
                <div style={{color:'#6b7280',fontSize:13}}>
                  {h.enrolledAt ? `Enrolled: ${new Date(h.enrolledAt).toLocaleDateString()}` : ''}
                  {h.unenrolledAt ? <div>Unenrolled: {new Date(h.unenrolledAt).toLocaleDateString()}</div> : null}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

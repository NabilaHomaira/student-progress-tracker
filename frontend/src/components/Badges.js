import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Badges.css';

export default function Badges(){
  const { user } = useContext(AuthContext);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{ if(user) load(); }, [user]);

  const load = async ()=>{
    setLoading(true); setError(null);
    try{
      const studentId = user?._id || user?.id;
      if(!studentId) return setError('Sign in to view badges');
      const res = await api.get(`/badges/student/${studentId}`);
      const data = res.data || {};
      setBadges(data.badges || []);
    }catch(e){
      const msg = e?.response?.data?.message || e.message || 'Failed to load badges';
      setError(msg);
      console.error('Badge load error', e);
    }finally{ setLoading(false); }
  };

  return (
    <div className="badges-container">
      <h3>Achievements & Badges</h3>
      {!user && <p>Please log in to view your badges.</p>}
      {loading && <p>Loading badges…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && user && (
        <div className="badges-list">
          {badges.length === 0 ? (
            <p>No badges earned yet. Keep working to earn achievements!</p>
          ) : (
            badges.map(b => (
              <div key={b.id || b._id || b.code} className="badge-card">
                <div className="badge-icon">🏅</div>
                <div className="badge-info">
                  <div className="badge-name">{b.name || b.title}</div>
                  <div className="badge-desc">{b.description || b.summary || ''}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

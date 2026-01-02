import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function NavBar(){
  const { user, logout } = React.useContext(AuthContext);
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav('/login');
  };

  return (
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 1.25rem',background:'#0b1220',color:'#fff',boxShadow:'0 4px 18px rgba(2,6,23,0.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <Link to="/" style={{color:'#fff',textDecoration:'none',fontWeight:700,fontSize:18}}>Student Progress Tracker</Link>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        {user ? (
            <>
            <span style={{opacity:0.9,fontSize:14}}>{user.name} <span style={{opacity:0.6,fontSize:13}}>({user.role})</span></span>
            <Link to="/courses" style={{color:'#fff',textDecoration:'none'}}>Courses</Link>
            {user.role === 'student' && (
              <Link to="/enrollment-history" style={{color:'#fff',textDecoration:'none'}}>My Enrollments</Link>
            )}
            {user.role === 'teacher' && (
              <Link to="/instructor-dashboard" style={{color:'#fff',textDecoration:'none'}}>Instructor Dashboard</Link>
            )}
            <button onClick={doLogout} className="btn" style={{background:'#ef4444',color:'#fff'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{color:'#fff',textDecoration:'none'}}>Login</Link>
            <Link to="/register" style={{color:'#fff',textDecoration:'none'}}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

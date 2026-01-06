import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import UpcomingDeadlines from './UpcomingDeadlines';

export default function Home(){
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = React.useContext(AuthContext);

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      setLoading(true);
      try{
        console.log('Home: Fetching courses...');
        const res = await api.get('/courses');
        if(!mounted) return;
        const coursesList = Array.isArray(res.data) ? res.data : [];
        console.log('Home: Loaded', coursesList.length, 'courses');
        setCourses(coursesList);
      }catch(e){ 
        console.error('Error loading courses:', e);
        console.error('Error status:', e.response?.status);
        if (e.response?.status === 401) {
          console.warn('Authentication required for courses');
        }
        setCourses([]); // Set empty array on error
      }
      setLoading(false);
    };
    load();
    return ()=> mounted = false;
  },[]);

  const totalCourses = courses.length;
  const totalArchived = courses.filter(c=>c.archived).length;
  const totalEnrolled = courses.reduce((sum,c)=> sum + (c.enrolledStudents?.length||0), 0);
  const recent = courses.slice(0,5);

  // Student-specific view: show only enrolled courses
  const enrolledForUser = user && user.role === 'student'
    ? courses.filter(c => (c.enrolledStudents || []).some(id => id === user._id || id === user.id))
    : [];

  return (
    <div style={{maxWidth:980,margin:'2rem auto'}}>
      <div style={{display:'flex',gap:20,alignItems:'center',marginBottom:20}}>
        <div style={{flex:1}}>
          <h1 style={{margin:0}}>Student Progress Tracker</h1>
          <p style={{color:'#6b7280'}}>Overview dashboard with quick stats and recent items.</p>
        </div>
        <div>
          <Link to="/courses" className="btn" style={{background:'#4f46e5',color:'#fff'}}>Go to Courses</Link>
        </div>
      </div>

      {/* Upcoming Deadlines - Previous Feature */}
      <div style={{marginBottom: '2rem'}}>
        <UpcomingDeadlines />
      </div>

      {user?.role === 'student' ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:20}}>
          <div className="card">
            <h4 style={{margin:0}}>Courses you're enrolled in</h4>
            <div style={{fontSize:28,fontWeight:700,marginTop:8}}>{loading ? '—' : (enrolledForUser.length)}</div>
          </div>
          <div className="card">
            <h4 style={{margin:0}}>Upcoming items</h4>
            <div style={{color:'#6b7280',marginTop:8}}>No upcoming items — check your course pages.</div>
          </div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
          <div className="card">
            <h4 style={{margin:0}}>Total courses</h4>
            <div style={{fontSize:28,fontWeight:700,marginTop:8}}>{loading ? '—' : totalCourses}</div>
          </div>
          <div className="card">
            <h4 style={{margin:0}}>Total enrolled</h4>
            <div style={{fontSize:28,fontWeight:700,marginTop:8}}>{loading ? '—' : totalEnrolled}</div>
          </div>
          <div className="card">
            <h4 style={{margin:0}}>Archived courses</h4>
            <div style={{fontSize:28,fontWeight:700,marginTop:8}}>{loading ? '—' : totalArchived}</div>
          </div>
        </div>
      )}

      <div>
        <h3>{user?.role === 'student' ? 'Your courses' : 'Recent courses'}</h3>
        {loading ? <div style={{color:'#6b7280'}}>Loading...</div> : (
          (user?.role === 'student' ? (enrolledForUser.length===0 ? <div style={{color:'#6b7280'}}>You are not enrolled in any courses</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
              {enrolledForUser.map(c => (
                <div key={c._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1}}>
                    <div style={{fontWeight:700,textAlign:'center'}}>{c.title}</div>
                    <div style={{color:'#6b7280',textAlign:'center'}}>{c.code} • {c.instructor?.name || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )) : (recent.length===0 ? <div style={{color:'#6b7280'}}>No recent courses</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
              {recent.map(c => (
                <div key={c._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1}}>
                    <div style={{fontWeight:700,textAlign:'center'}}>{c.title}</div>
                    <div style={{color:'#6b7280',textAlign:'center'}}>{c.code} • {c.instructor?.name || '—'}</div>
                  </div>
                  <div style={{marginLeft:12}}>
                    <Link to="/courses" className="btn">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          )) )
        )}
      </div>
    </div>
  );
}

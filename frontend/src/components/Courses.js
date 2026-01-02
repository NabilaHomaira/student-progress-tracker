import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CourseCard from './CourseCard';
import { AuthContext } from '../contexts/AuthContext';

export default function Courses(){
  const [courses,setCourses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showArchived,setShowArchived]=useState(false);
  const [viewMode,setViewMode]=useState('all'); // 'all' or 'mine'

  const fetchCourses = async ()=>{
    setLoading(true);
    try{
      const res = await api.get('/courses', { params: { showArchived: showArchived } });
      let list = res.data || [];
      // if user asked to view archived only, filter to archived courses
      if(showArchived){
        list = list.filter(c => c.archived === true);
      }
      setCourses(list);
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ fetchCourses(); },[showArchived]);

  const { user } = React.useContext(AuthContext);

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <h2 style={{margin:0}}>Courses</h2>
          {/* Move New Course button next to title for teachers/admins */}
          {(user && (user.role === 'teacher' || user.role === 'admin')) && (
            <CreateCourseButton onCreated={fetchCourses} />
          )}
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {/* Only teachers/admins can view archived and toggle view modes; keep these on the right */}
          {(user && (user.role === 'teacher' || user.role === 'admin')) && (
            <>
              <label style={{display:'flex',alignItems:'center',gap:6}}>
                <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} /> Show archived
              </label>
              <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:8}}>
                <label style={{display:'flex',alignItems:'center',gap:6}}>
                  <input type="radio" name="viewMode" value="all" checked={viewMode==='all'} onChange={()=>setViewMode('all')} /> All
                </label>
                <label style={{display:'flex',alignItems:'center',gap:6}}>
                  <input type="radio" name="viewMode" value="mine" checked={viewMode==='mine'} onChange={()=>setViewMode('mine')} /> My courses
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? <div style={{textAlign:'center',padding:20}}>Loading...</div> : (
        (() => {
          let list = courses || [];
          if (viewMode === 'mine' && user) {
            list = list.filter(c => c.instructor && (c.instructor._id === user._id || c.instructor === user._id));
          }
          if (list.length === 0) {
            return (<div style={{textAlign:'center',color:'#6b7280',padding:40}}>{showArchived ? 'No archived courses' : (viewMode === 'mine' ? 'No courses created by you' : 'No courses available')}</div>);
          }
          return (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {list.map(c => (
                <div key={c._id} style={{width:'100%'}}>
                  <CourseCard course={c} onChanged={fetchCourses} />
                </div>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}

function CreateCourseButton({ onCreated }){
  const [open,setOpen]=useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(true)} className="btn" style={{background:'#4f46e5',color:'#fff'}}>New Course</button>
      {open && <CourseForm onClose={()=>{setOpen(false); onCreated();}} />}
    </div>
  );
}

function CourseForm({ onClose }){
  const [title,setTitle]=useState('');
  const [code,setCode]=useState('');
  const [description,setDescription]=useState('');
  const [capacity,setCapacity]=useState(30);
  const [err,setErr]=useState('');

  const submit = async (e)=>{
    e.preventDefault();
    setErr('');
    try{
      // get current user to set as instructor
      const me = await api.get('/auth/me');
      const instructorId = me.data.user._id;
      await api.post('/courses', { title, code, description, instructor: instructorId, capacity });
      onClose();
    }catch(e){ setErr(e.response?.data?.message || 'Create failed'); }
  };

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.45)',zIndex:1200}}>
      <form onSubmit={submit} className="card" style={{minWidth:360,zIndex:1300}}>
        <h3 style={{marginTop:0}}>New Course</h3>
        <div style={{marginBottom:8}}>
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Code</label>
          <input value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Capacity</label>
          <input type="number" value={capacity} onChange={e=>setCapacity(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        {err && <div style={{color:'red',marginBottom:8}}>{err}</div>}
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button type="button" onClick={onClose} className="btn">Cancel</button>
          <button type="submit" className="btn" style={{background:'#10b981',color:'#fff'}}>Create</button>
        </div>
      </form>
    </div>
  );
}

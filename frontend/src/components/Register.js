import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Register(){
  const { register } = React.useContext(AuthContext);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('student');
  const [err,setErr]=useState('');
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    setErr('');
    try{
      await register(name,email,password,role);
      nav('/home');
    }catch(e){ setErr(e.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div style={{maxWidth:520,margin:'2.5rem auto'}}>
      <div className="card">
        <h2 style={{marginTop:0}}>Create an account</h2>
        <p style={{color:'#6b7280'}}>Sign up as a teacher or student.</p>
        <form onSubmit={submit} style={{marginTop:12}}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%'}} />
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
          </div>
          {err && <div style={{color:'red',marginBottom:8}}>{err}</div>}
          <div style={{display:'flex',gap:8}}>
            <button type="submit" className="btn" style={{background:'#059669',color:'#fff'}}>Create account</button>
            <button type="button" onClick={()=>{ setName(''); setEmail(''); setPassword(''); }} className="btn">Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

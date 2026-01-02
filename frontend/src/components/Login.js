import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Login(){
  const { login } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    setErr('');
    try{
      await login(email,password);
      nav('/home');
    }catch(e){ setErr(e.response?.data?.message || 'Login failed'); }
  };

  return (
    <div style={{maxWidth:520,margin:'2.5rem auto'}}>
      <div className="card">
        <h2 style={{marginTop:0}}>Welcome back</h2>
        <p style={{color:'#6b7280'}}>Sign in to manage your courses</p>
        <form onSubmit={submit} style={{marginTop:12}}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
          </div>
          {err && <div style={{color:'red',marginBottom:8}}>{err}</div>}
          <div style={{display:'flex',gap:8}}>
            <button type="submit" className="btn" style={{background:'#2563eb',color:'#fff'}}>Login</button>
            <button type="button" onClick={()=>{ setEmail(''); setPassword(''); }} className="btn">Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

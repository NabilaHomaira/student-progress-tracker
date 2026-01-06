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
  const [passwordErrors, setPasswordErrors] = useState([]);
  const nav = useNavigate();

  // Password validation rules
  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('One special character');
    }
    return errors;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd.length > 0) {
      setPasswordErrors(validatePassword(pwd));
    } else {
      setPasswordErrors([]);
    }
  };

  const submit = async (e)=>{
    e.preventDefault();
    setErr('');
    
    // Validate password before submission
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setErr(`Password must contain: ${pwdErrors.join(', ')}`);
      return;
    }
    
    try{
      await register(name,email,password,role);
      nav('/home');
    }catch(e){ 
      console.error('Registration error:', e);
      let errorMessage = 'Registration failed';
      
      if (e.response) {
        // Server responded with error
        errorMessage = e.response?.data?.message || e.response?.data?.error || 'Registration failed';
        console.error('Server error response:', e.response.data);
      } else if (e.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5000.';
        console.error('No response from server');
      } else {
        // Something else happened
        errorMessage = e.message || 'Registration failed. Please try again.';
        console.error('Error:', e.message);
      }
      
      setErr(errorMessage);
    }
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
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange} 
              style={{width:'100%'}} 
            />
            {password.length > 0 && (
              <div style={{marginTop:8,fontSize:'0.85rem',color:'#6b7280'}}>
                <div style={{marginBottom:4,fontWeight:'bold'}}>Password must contain:</div>
                <ul style={{margin:0,paddingLeft:20}}>
                  <li style={{color:password.length >= 8 ? '#059669' : '#ef4444'}}>
                    At least 8 characters
                  </li>
                  <li style={{color:/[A-Z]/.test(password) ? '#059669' : '#ef4444'}}>
                    One uppercase letter
                  </li>
                  <li style={{color:/[a-z]/.test(password) ? '#059669' : '#ef4444'}}>
                    One lowercase letter
                  </li>
                  <li style={{color:/[0-9]/.test(password) ? '#059669' : '#ef4444'}}>
                    One number
                  </li>
                  <li style={{color:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '#059669' : '#ef4444'}}>
                    One special character (!@#$%^&* etc.)
                  </li>
                </ul>
              </div>
            )}
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

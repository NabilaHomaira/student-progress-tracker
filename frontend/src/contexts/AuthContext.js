import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(()=>{
    let mounted = true;
    const restore = async () => {
      if(token){
        localStorage.setItem('token', token);
        setLoading(true);
        try{
          const res = await api.get('/auth/me');
          if(!mounted) return;
          setUser(res.data.user);
        }catch(err){
          if(!mounted) return;
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        } finally {
          if(mounted) setLoading(false);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    };
    restore();
    return ()=> mounted = false;
  },[token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    setLoading(false);
    return res;
  };

  const register = async (name, email, password, role='teacher') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    setToken(res.data.token);
    setUser(res.data.user);
    setLoading(false);
    return res;
  };

  const logout = async () => {
    const t = localStorage.getItem('token');
    try { await api.post('/auth/logout', { token: t }); } catch(e){}
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import Courses from './components/Courses';
import Home from './components/Home';
import EnrollmentHistory from './components/EnrollmentHistory';
import InstructorDashboard from './components/InstructorDashboard';

function RequireAuth({ children }){
  const { user, loading } = React.useContext(AuthContext);
  if(loading) return <div style={{padding:40,textAlign:'center'}}>Checking authentication...</div>;
  if(!user) return <Navigate to="/login" />;
  return children;
}

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <div className="App" style={{padding: '1rem'}}>
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/home" element={<RequireAuth><Home/></RequireAuth>} />
            <Route path="/courses" element={<RequireAuth><Courses/></RequireAuth>} />
            <Route path="/enrollment-history" element={<RequireAuth><EnrollmentHistory/></RequireAuth>} />
            <Route path="/instructor-dashboard" element={<RequireAuth><InstructorDashboard/></RequireAuth>} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

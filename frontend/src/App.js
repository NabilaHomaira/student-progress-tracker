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
import AssignmentDashboard from './components/AssignmentDashboard';
import StudentProgress from './components/StudentProgress';
import TrendAnalysis from './components/TrendAnalysisNew';
import FocusAreas from './components/FocusAreas';
import Badges from './components/Badges';

function RequireAuth({ children }){
  const { user, loading } = React.useContext(AuthContext);
  if(loading) return <div style={{padding:40,textAlign:'center'}}>Loading...</div>;
  return children;
}

function RoleGuard({ allowedRoles = [], children }){
  const { user, loading } = React.useContext(AuthContext);
  if(loading) return <div style={{padding:40,textAlign:'center'}}>Loading...</div>;
  if(!user) return <Navigate to="/login" replace />;
  if(allowedRoles.length > 0 && !allowedRoles.includes(user.role)){
    return <Navigate to="/home" replace />;
  }
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
            <Route path="/home" element={<Home/>} />
            <Route path="/courses" element={<Courses/>} />
            <Route path="/enrollment-history" element={<RoleGuard allowedRoles={["student"]}><EnrollmentHistory/></RoleGuard>} />
            <Route path="/instructor-dashboard" element={<RoleGuard allowedRoles={["teacher","admin","assistant"]}><InstructorDashboard/></RoleGuard>} />
            <Route path="/assignments" element={<RoleGuard allowedRoles={["teacher","admin","assistant"]}><AssignmentDashboard/></RoleGuard>} />
            <Route path="/student-progress" element={<RequireAuth><StudentProgress/></RequireAuth>} />
            <Route path="/trend-analysis" element={<RequireAuth><TrendAnalysis/></RequireAuth>} />
            <Route path="/focus-areas" element={<RequireAuth><FocusAreas/></RequireAuth>} />
            <Route path="/badges" element={<RequireAuth><Badges/></RequireAuth>} />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RootRedirect(){
  const { user, loading } = React.useContext(AuthContext);
  if(loading) return <div style={{padding:40,textAlign:'center'}}>Loading...</div>;
  if(user) return <Navigate to="/home" replace />;
  return <Navigate to="/login" replace />;
}

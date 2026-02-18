import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import StudyPlanner from './pages/StudyPlanner';
import Analytics from './pages/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRole="teacher">
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRole="student">
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/study-planner" element={
              <ProtectedRoute allowedRole="student">
                <DashboardLayout>
                  <StudyPlanner />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

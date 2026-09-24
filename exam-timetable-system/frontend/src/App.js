import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentTimetable from './pages/StudentTimetable';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/student/login" replace />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin" redirectTo="/admin/login">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/timetable"
            element={
              <PrivateRoute role="student" redirectTo="/student/login">
                <StudentTimetable />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/student/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

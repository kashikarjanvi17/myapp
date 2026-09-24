import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a page and only renders it if a logged-in user with the
 * required role is present; otherwise redirects to the given path.
 */
export default function PrivateRoute({ children, role, redirectTo }) {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

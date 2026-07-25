import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protection wrapper to guard routes based on authentication state and user roles.
 * 
 * @param {Object} props
 * @param {boolean} props.isAuthenticated - Current auth state
 * @param {string} props.role - Current user role
 * @param {Array<string>} props.allowedRoles - List of roles permitted to access the route
 * @param {React.ReactNode} props.children - Route component to render if permitted
 */
export default function ProtectedRoute({ 
  isAuthenticated, 
  role, 
  allowedRoles, 
  children 
}) {
  // If not authenticated, redirect to Login page (located at root '/' route)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is not authorized, redirect to unauthorized route
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children components if authorized
  return children;
}

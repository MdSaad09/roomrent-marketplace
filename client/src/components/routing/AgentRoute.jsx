// client/src/components/routing/AgentRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AgentRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Check if user is an agent
  if (user.role !== 'agent') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default AgentRoute;
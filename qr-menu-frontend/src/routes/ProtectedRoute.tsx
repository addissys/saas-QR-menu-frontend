import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/roles';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user?.role);
  const isOwner = role === 'CAFE_OWNER';

  if (isOwner && user?.isOnboardingCompleted === false) {
    const isAllowedOnboardingRoute =
      location.pathname === '/restaurants' ||
      location.pathname === '/restaurants/create' ||
      location.pathname === '/profile' ||
      location.pathname === '/change-password';

    if (!isAllowedOnboardingRoute) {
      return <Navigate to="/restaurants" replace />;
    }
  }

  return <>{children}</>;
};
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { isRoleAllowed } from '../utils/roles';

interface Props {
  allowedRoles: (UserRole | string)[];
  redirectTo?: string;
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<Props> = ({
  allowedRoles,
  redirectTo = '/unauthorized',
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !isRoleAllowed(user.role, allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { normalizeRole } from '../utils/roles';

interface Props {
  permission?: string;
  anyPermission?: string[];
  managementRolesAllowed?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}

export const PermissionProtectedRoute: React.FC<Props> = ({
  permission,
  anyPermission = [],
  managementRolesAllowed = true,
  redirectTo = '/unauthorized',
  children,
}) => {
  const { user, isLoading } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermission();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRole(user.role);

  // Super Admin always allowed
  if (normalizedRole === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Management roles bypass if permitted
  if (
    managementRolesAllowed &&
    ['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole)
  ) {
    return <>{children}</>;
  }

  // Check specific required permission
  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  // Check any required permissions
  if (anyPermission.length > 0 && hasAnyPermission(...anyPermission)) {
    return <>{children}</>;
  }

  return <Navigate to={redirectTo} replace />;
};

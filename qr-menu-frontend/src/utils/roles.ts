import { UserRole } from '../types';

export type NormalizedUserRole =
  | 'SUPER_ADMIN'
  | 'CAFE_OWNER'
  | 'OWNER'
  | 'RESTAURANT_OWNER'
  | 'EXECUTIVE'
  | 'BRANCH_MANAGER'
  | 'STAFF';

/**
 * Normalizes any backend role string or variation into a standard NormalizedUserRole.
 * Handles casing, spacing, underscores, and aliases.
 */
export const normalizeRole = (role?: string | null): NormalizedUserRole | 'UNKNOWN' => {
  if (!role || typeof role !== 'string') {
    return 'UNKNOWN';
  }

  const clean = role
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  switch (clean) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
    case 'ADMIN':
    case 'GLOBAL_ADMIN':
      return 'SUPER_ADMIN';

    case 'CAFE_OWNER':
    case 'RESTAURANT_OWNER':
    case 'OWNER':
      return 'CAFE_OWNER';

    case 'EXECUTIVE':
    case 'EXECUTIVE_DIRECTOR':
    case 'REGIONAL_EXECUTIVE':
      return 'EXECUTIVE';

    case 'BRANCH_MANAGER':
    case 'MANAGER':
    case 'STORE_MANAGER':
      return 'BRANCH_MANAGER';

    case 'STAFF':
    case 'KITCHEN_STAFF':
    case 'WAIT_STAFF':
    case 'EMPLOYEE':
      return 'STAFF';

    default:
      // Heuristic fallback for partial matches
      if (clean.includes('SUPER') && clean.includes('ADMIN')) return 'SUPER_ADMIN';
      if (clean.includes('CAFE') && clean.includes('OWNER')) return 'CAFE_OWNER';
      if (clean.includes('RESTAURANT') && clean.includes('OWNER')) return 'CAFE_OWNER';
      if (clean.includes('BRANCH') && clean.includes('MANAGER')) return 'BRANCH_MANAGER';
      if (clean.includes('EXEC')) return 'EXECUTIVE';
      if (clean.includes('STAFF') || clean.includes('KITCHEN')) return 'STAFF';
      return 'UNKNOWN';
  }
};

/**
 * Maps each normalized role to its dedicated dashboard URL
 */
export const roleDashboardMap: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  CAFE_OWNER: '/dashboard',
  OWNER: '/dashboard',
  RESTAURANT_OWNER: '/dashboard',
  EXECUTIVE: '/executive/dashboard',
  BRANCH_MANAGER: '/manager/dashboard',
  STAFF: '/staff/dashboard',
};

/**
 * Returns the destination dashboard path for a given user role.
 * If the role is unknown or invalid, returns '/unauthorized'.
 */
export const getDashboardRouteForRole = (role?: string | null): string => {
  const norm = normalizeRole(role);
  if (norm === 'UNKNOWN') {
    return '/unauthorized';
  }
  return roleDashboardMap[norm] || '/unauthorized';
};

/**
 * Checks if a given user role is authorized against an array of allowed roles.
 */
export const isRoleAllowed = (
  userRole: string | null | undefined,
  allowedRoles: (string | UserRole)[]
): boolean => {
  const normalizedUserRole = normalizeRole(userRole);
  if (normalizedUserRole === 'UNKNOWN') return false;

  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  return normalizedAllowed.includes(normalizedUserRole);
};

/**
 * Returns human-readable label for a role
 */
export const getRoleDisplayName = (role?: string | null): string => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'CAFE_OWNER':
      return 'Cafe Owner';
    case 'EXECUTIVE':
      return 'Executive';
    case 'BRANCH_MANAGER':
      return 'Branch Manager';
    case 'STAFF':
      return 'Staff';
    default:
      return 'Unknown Role';
  }
};

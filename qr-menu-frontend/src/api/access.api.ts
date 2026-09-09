import api from './axios';
import { User, UserRole } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

export interface RoleRecord {
  id: string;
  name: UserRole | string;
  description?: string;
}

export interface PermissionRecord {
  id: string;
  permission: string;
  module: string;
  action: string;
  description?: string;
}

const mapUser = (raw: any): User => ({
  id: raw.id,
  fullName: raw.full_name ?? raw.fullName ?? '',
  email: raw.email ?? '',
  phone: raw.phone ?? undefined,
  role: (raw.role?.name ?? raw.role) as UserRole,
  tenantId: raw.staff_profile?.[0]?.branch?.tenant_id ?? raw.tenant_id ?? '',
  branchId: raw.staff_profile?.[0]?.branch_id,
  assignedBranchIds: raw.staff_profile?.map((entry: any) => entry.branch_id).filter(Boolean) ?? [],
  isActive: raw.is_active ?? raw.isActive ?? true,
  createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
});

export const accessApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    const mapped = list.map(mapUser);
    const currentUser = useAuthStore.getState().user;

    if (!currentUser || currentUser.role === 'SUPER_ADMIN' || !currentUser.tenantId) {
      return mapped;
    }

    const tenantBranches = await branchApi.getAll();
    const tenantBranchIds = new Set(tenantBranches.data.map((branch) => branch.id));

    return mapped.filter(
      (entry: User) =>
        entry.tenantId === currentUser.tenantId ||
        (entry.branchId ? tenantBranchIds.has(entry.branchId) : false) ||
        entry.assignedBranchIds?.some((bid: string) => tenantBranchIds.has(bid))
    );
  },
  getRoles: async (): Promise<RoleRecord[]> => {
    const response = await api.get('/roles');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
  getPermissions: async (): Promise<PermissionRecord[]> => {
    const response = await api.get('/permissions');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
  // Returns only permissions the current actor is authorized to grant.
  // Use this for the Additional Permissions assignment modal.
  getGrantablePermissions: async (): Promise<PermissionRecord[]> => {
    const response = await api.get('/permissions/grantable');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
  getRolePermissions: async (roleId: string): Promise<PermissionRecord[]> => {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data?.data?.permissions ?? response.data?.data ?? [];
  },
  getUserPermissions: async (userId: string): Promise<PermissionRecord[]> => {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data?.data ?? [];
  },
  assignRolePermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.post(`/roles/${roleId}/permissions/assign`, { permission_ids: permissionIds });
    return response.data?.data?.permissions ?? response.data?.data ?? [];
  },
  revokeRolePermission: async (roleId: string, permissionId: string) => {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  },
  createUser: async (payload: { full_name: string; email: string; phone?: string; password: string; role_id: string; branch_id?: string; branch_ids?: string[] }) => {
    const response = await api.post('/users', payload);
    return response.data?.data;
  },
  updateUser: async (userId: string, payload: { full_name?: string; email?: string; phone?: string; role_id?: string; branch_id?: string; branch_ids?: string[] }) => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data?.data;
  },
  setUserPermissions: async (userId: string, permissionIds: string[]) => {
    const response = await api.post(`/users/${userId}/permissions`, { permission_ids: permissionIds });
    return response.data?.data ?? [];
  },
  revokeUserPermission: async (userId: string, permissionId: string) => {
    await api.delete(`/users/${userId}/permissions/${permissionId}`);
  },
  createRole: async (payload: { name: string; description?: string }) => {
    const response = await api.post('/roles', payload);
    return response.data?.data;
  },
  updateRole: async (roleId: string, payload: { name?: string; description?: string }) => {
    const response = await api.patch(`/roles/${roleId}`, payload);
    return response.data?.data;
  },
  deleteRole: async (roleId: string) => {
    await api.delete(`/roles/${roleId}`);
  },
};

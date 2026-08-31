import api from './axios';
import { Branch } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { tenantApi } from './tenant.api';

const mapBranch = (branch: any): Branch => ({
  id: branch.id,
  tenantId: branch.tenant_id ?? branch.tenantId ?? branch.tenant?.id ?? '',
  tenantName: branch.tenant?.business_name ?? branch.tenantName ?? '',
  name: branch.branch_name ?? branch.name ?? '',
  address: branch.address ?? '',
  city: branch.city ?? '',
  phone: branch.phone ?? '',
  openingHours: branch.opening_hours ?? branch.openingHours,
  isActive: branch.is_active ?? branch.isActive ?? branch.status === 'ACTIVE',
  createdAt: branch.created_at ?? branch.createdAt ?? new Date().toISOString(),
});

const unwrapBranches = (response: any): Branch[] => {
  const payload = response.data?.data ?? response.data;
  const branches = payload?.branches ?? payload;
  return Array.isArray(branches) ? branches.map(mapBranch) : [];
};

export const branchApi = {
  getAll: async (): Promise<{ data: Branch[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const tenantId = user?.tenantId;

    const params: Record<string, string> = {};
    if (tenantId && !isSuperAdmin) {
      params.tenant_id = tenantId;
    }

    const response = await api.get('/branches', { params });
    const all = unwrapBranches(response);

    // Multi-tenant isolation guard: filter out any branches not belonging to user's tenant
    if (tenantId && !isSuperAdmin) {
      return { data: all.filter((b) => b.tenantId === tenantId) };
    }

    return { data: all };
  },

  getAllGlobal: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get('/branches');
    return { data: unwrapBranches(response) };
  },

  getById: async (id: string): Promise<{ data: Branch }> => {
    const response = await api.get(`/branches/${id}`);
    return { data: mapBranch(response.data.data?.branch ?? response.data.data) };
  },

  create: async (payload: Partial<Branch> & { name: string; address: string; phone?: string; city?: string }): Promise<{ data: Branch }> => {
    let tenantId = payload.tenantId || useAuthStore.getState().user?.tenantId;
    if (!tenantId) {
      try {
        const profile = await tenantApi.getProfile();
        tenantId = profile.data?.id;
      } catch {
        // Ignore fallback failure
      }
    }

    if (!tenantId) {
      throw new Error('No active restaurant tenant found. Please set up your restaurant profile first.');
    }

    const cleanName = payload.name.trim().replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase();
    const branchCode = (payload as any).branchCode || `${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;

    const response = await api.post('/branches', {
      tenant_id: tenantId,
      branch_name: payload.name.trim(),
      branch_code: branchCode,
      address: payload.address.trim(),
      city: payload.city?.trim() || 'Default City',
      phone: payload.phone?.trim() || undefined,
      is_active: payload.isActive ?? true,
    });
    return { data: mapBranch(response.data.data?.branch ?? response.data.data) };
  },

  update: async (id: string, payload: Partial<Branch>): Promise<{ data: Branch }> => {
    const response = await api.patch(`/branches/${id}`, {
      ...(payload.name !== undefined && { branch_name: payload.name.trim() }),
      ...(payload.address !== undefined && { address: payload.address.trim() }),
      ...(payload.city !== undefined && { city: payload.city.trim() }),
      ...(payload.phone !== undefined && { phone: payload.phone.trim() }),
      ...(payload.isActive !== undefined && { is_active: payload.isActive }),
    });
    return { data: mapBranch(response.data.data?.branch ?? response.data.data) };
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ data: Branch }> => {
    return branchApi.update(id, { isActive });
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};

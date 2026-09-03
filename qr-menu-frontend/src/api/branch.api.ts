import { AxiosResponse } from 'axios';
import api from './axios';
import { Branch } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { tenantApi } from './tenant.api';

// ---------------------------------------------------------------------------
// Raw API shapes (snake_case, as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawBranch {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  tenant?: {
    id?: string;
    business_name?: string;
  };
  branch_name?: string;
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  opening_hours?: Branch['openingHours'];
  openingHours?: Branch['openingHours'];
  is_active?: boolean;
  isActive?: boolean;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface BranchListPayload {
  branches?: RawBranch[];
}

interface BranchDetailPayload {
  branch?: RawBranch;
}

type CreateBranchPayload = Partial<Branch> & {
  name: string;
  address: string;
  phone?: string;
  city?: string;
  branchCode?: string;
};

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapBranch = (branch: RawBranch): Branch => ({
  id: branch.id,
  tenantId: branch.tenant_id ?? branch.tenantId ?? branch.tenant?.id ?? '',
  tenantName: branch.tenant?.business_name ?? '',
  name: branch.branch_name ?? branch.name ?? '',
  address: branch.address ?? '',
  city: branch.city ?? '',
  phone: branch.phone ?? '',
  openingHours: branch.opening_hours ?? branch.openingHours,
  isActive: branch.is_active ?? branch.isActive ?? branch.status === 'ACTIVE',
  createdAt: branch.created_at ?? branch.createdAt ?? new Date().toISOString(),
});

const unwrapBranches = (
  response: AxiosResponse<ApiEnvelope<BranchListPayload | RawBranch[]> | RawBranch[]>
): Branch[] => {
  const body = response.data as ApiEnvelope<BranchListPayload | RawBranch[]> | RawBranch[];
  const payload = Array.isArray(body) ? body : body?.data ?? body;
  const branches = Array.isArray(payload)
    ? payload
    : (payload as BranchListPayload)?.branches;

  return Array.isArray(branches) ? branches.map(mapBranch) : [];
};

const unwrapBranch = (
  response: AxiosResponse<ApiEnvelope<BranchDetailPayload | RawBranch>>
): Branch => {
  const payload = response.data.data;
  const raw = (payload as BranchDetailPayload)?.branch ?? (payload as RawBranch);
  return mapBranch(raw);
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const branchApi = {
  getAll: async (): Promise<{ data: Branch[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const tenantId = user?.tenantId;

    const params: Record<string, string> = {};
    if (tenantId && !isSuperAdmin) {
      params.tenant_id = tenantId;
    }

    const response = await api.get<ApiEnvelope<BranchListPayload | RawBranch[]> | RawBranch[]>(
      '/branches',
      { params }
    );
    const all = unwrapBranches(response);

    if (tenantId && !isSuperAdmin) {
      return { data: all.filter((b) => b.tenantId === tenantId) };
    }

    return { data: all };
  },

  getAllGlobal: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get<ApiEnvelope<BranchListPayload | RawBranch[]> | RawBranch[]>(
      '/branches'
    );
    return { data: unwrapBranches(response) };
  },

  getById: async (id: string): Promise<{ data: Branch }> => {
    const response = await api.get<ApiEnvelope<BranchDetailPayload | RawBranch>>(
      `/branches/${id}`
    );
    return { data: unwrapBranch(response) };
  },

  create: async (payload: CreateBranchPayload): Promise<{ data: Branch }> => {
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
    const branchCode = payload.branchCode || `${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;

    const response = await api.post<ApiEnvelope<BranchDetailPayload | RawBranch>>('/branches', {
      tenant_id: tenantId,
      branch_name: payload.name.trim(),
      branch_code: branchCode,
      address: payload.address.trim(),
      city: payload.city?.trim() || 'Default City',
      phone: payload.phone?.trim() || undefined,
      is_active: payload.isActive ?? true,
    });

    return { data: unwrapBranch(response) };
  },

  update: async (id: string, payload: Partial<Branch>): Promise<{ data: Branch }> => {
    const response = await api.patch<ApiEnvelope<BranchDetailPayload | RawBranch>>(
      `/branches/${id}`,
      {
        ...(payload.name !== undefined && { branch_name: payload.name.trim() }),
        ...(payload.address !== undefined && { address: payload.address.trim() }),
        ...(payload.city !== undefined && { city: payload.city.trim() }),
        ...(payload.phone !== undefined && { phone: payload.phone.trim() }),
        ...(payload.isActive !== undefined && { is_active: payload.isActive }),
      }
    );

    return { data: unwrapBranch(response) };
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ data: Branch }> => {
    return branchApi.update(id, { isActive });
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const response = await api.delete<{ success: boolean }>(`/branches/${id}`);
    return response.data as unknown as { data: { success: boolean } };
  },
};
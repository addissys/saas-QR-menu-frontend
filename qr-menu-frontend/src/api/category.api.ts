import api from './axios';
import { Category } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

export interface CreateCategoryPayload {
  branch_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  sort_order?: number;
}

export const categoryApi = {
  getAll: async (branchId?: string): Promise<Category[]> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (branchId) {
      const res = await api.get('/categories', { params: { branch_id: branchId } });
      return res.data.data?.categories ?? [];
    }

    const res = await api.get('/categories');
    const categories: Category[] = res.data.data?.categories ?? [];

    // Tenant isolation: filter categories by branches belonging to the user's tenant
    if (!isSuperAdmin && user?.tenantId) {
      const userBranchesRes = await branchApi.getAll();
      const userBranchIds = new Set(userBranchesRes.data.map((b) => b.id));
      return categories.filter((c: any) => userBranchIds.has(c.branchId || c.branch_id));
    }

    return categories;
  },

  getById: async (id: string): Promise<Category> => {
    const res = await api.get(`/categories/${id}`);
    return res.data.data?.category ?? res.data.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await api.post('/categories', payload);
    return res.data.data?.category ?? res.data.data;
  },

  update: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await api.patch(`/categories/${id}`, payload);
    return res.data.data?.category ?? res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
import { AxiosResponse } from 'axios';
import api from './axios';
import { Category } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawCategory {
  id: string;
  branch_id?: string;
  branchId?: string;
  name: string;
  description?: string;
  sort_order?: number;
  sortOrder?: number;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface CategoryListPayload {
  categories?: RawCategory[];
}

interface CategoryDetailPayload {
  category?: RawCategory;
}

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

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapCategory = (raw: RawCategory): Category => ({
  id: raw.id,
  branchId: raw.branch_id ?? raw.branchId ?? '',
  name: raw.name,
  description: raw.description ?? '',
  displayOrder: raw.sort_order ?? raw.sortOrder ?? 0,
  createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
});

const unwrapCategories = (
  response: AxiosResponse<ApiEnvelope<CategoryListPayload | RawCategory[]>>
): Category[] => {
  const payload = response.data.data ?? response.data;
  const categories = Array.isArray(payload)
    ? payload
    : (payload as CategoryListPayload)?.categories;

  return Array.isArray(categories) ? categories.map(mapCategory) : [];
};

const unwrapCategory = (
  response: AxiosResponse<ApiEnvelope<CategoryDetailPayload | RawCategory>>
): Category => {
  const payload = response.data.data;
  const raw = (payload as CategoryDetailPayload)?.category ?? (payload as RawCategory);
  return mapCategory(raw);
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const categoryApi = {
  getAll: async (branchId?: string): Promise<Category[]> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (branchId) {
      const res = await api.get<ApiEnvelope<CategoryListPayload | RawCategory[]>>(
        '/categories',
        { params: { branch_id: branchId } }
      );
      return unwrapCategories(res);
    }

    const res = await api.get<ApiEnvelope<CategoryListPayload | RawCategory[]>>('/categories');
    const categories = unwrapCategories(res);

    // Tenant isolation
    if (!isSuperAdmin && user?.tenantId) {
      const userBranchesRes = await branchApi.getAll();
      const userBranchIds = new Set(userBranchesRes.data.map((b) => b.id));
      return categories.filter((c) => c.branchId != null && userBranchIds.has(c.branchId));
    }

    return categories;
  },

  getById: async (id: string): Promise<Category> => {
    const res = await api.get<ApiEnvelope<CategoryDetailPayload | RawCategory>>(
      `/categories/${id}`
    );
    return unwrapCategory(res);
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await api.post<ApiEnvelope<CategoryDetailPayload | RawCategory>>(
      '/categories',
      payload
    );
    return unwrapCategory(res);
  },

  update: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await api.patch<ApiEnvelope<CategoryDetailPayload | RawCategory>>(
      `/categories/${id}`,
      payload
    );
    return unwrapCategory(res);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
import api from './axios';
import { MenuItem } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

const mapMenuItem = (item: any): MenuItem => ({
  id: item.id,
  tenantId: item.tenant_id ?? item.tenantId ?? item.branch?.tenant_id,
  branchId: item.branch_id ?? item.branchId ?? item.branch?.id,
  categoryId: item.category_id ?? item.categoryId ?? item.category?.id ?? '',
  categoryName: item.category?.name ?? item.categoryName,
  name: item.name ?? '',
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  imageUrl: item.image_url ?? item.imageUrl,
  isAvailable: item.is_available ?? item.isAvailable ?? true,
  isFeatured: item.is_featured ?? item.isFeatured ?? false,
  preparationTimeMinutes: item.preparation_time ?? item.preparationTimeMinutes,
  createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
});

const unwrapMenuItems = (response: any): MenuItem[] => {
  const payload = response.data?.data ?? response.data;
  const menuItems = payload?.menuItems ?? payload?.menu_items ?? payload?.items ?? payload;
  return Array.isArray(menuItems) ? menuItems.map(mapMenuItem) : [];
};

export const menuItemApi = {
  getAll: async (branchId?: string, categoryId?: string): Promise<{ data: MenuItem[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const tenantId = user?.tenantId;

    const params: Record<string, string> = {};
    if (branchId) params.branch_id = branchId;
    if (categoryId) params.category_id = categoryId;

    const response = await api.get('/menu-items', { params });
    const items = unwrapMenuItems(response);

    // Tenant isolation: filter items belonging to the user's tenant/branches
    if (!isSuperAdmin && tenantId && !branchId) {
      const userBranchesRes = await branchApi.getAll();
      const userBranchIds = new Set(userBranchesRes.data.map((b) => b.id));
      return {
        data: items.filter(
          (item) => item.tenantId === tenantId || (item.branchId && userBranchIds.has(item.branchId))
        ),
      };
    }

    return { data: items };
  },

  getAllGlobal: async (): Promise<{ data: MenuItem[] }> => {
    const response = await api.get('/menu-items');
    return { data: unwrapMenuItems(response) };
  },

  getById: async (id: string): Promise<{ data: MenuItem }> => {
    const response = await api.get(`/menu-items/${id}`);
    return { data: mapMenuItem(response.data.data?.menuItem ?? response.data.data) };
  },

  create: async (
    payload: Partial<MenuItem> & { name: string; price: number; categoryId: string; description: string }
  ): Promise<{ data: MenuItem }> => {
    const cleanImageUrl = payload.imageUrl?.trim() ? payload.imageUrl.trim() : undefined;
    const response = await api.post('/menu-items', {
      name: payload.name,
      price: payload.price,
      category_id: payload.categoryId,
      description: payload.description,
      ...(payload.branchId && { branch_id: payload.branchId }),
      ...(cleanImageUrl && { image_url: cleanImageUrl }),
      preparation_time: payload.preparationTimeMinutes,
      is_available: payload.isAvailable ?? true,
      is_featured: payload.isFeatured ?? false,
    });
    return { data: mapMenuItem(response.data.data?.menuItem ?? response.data.data) };
  },

  update: async (id: string, payload: Partial<MenuItem>): Promise<{ data: MenuItem }> => {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.price !== undefined) body.price = payload.price;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
    if (payload.imageUrl !== undefined) body.image_url = payload.imageUrl;
    if (payload.preparationTimeMinutes !== undefined) body.preparation_time = payload.preparationTimeMinutes;
    if (payload.isAvailable !== undefined) body.is_available = payload.isAvailable;
    if (payload.isFeatured !== undefined) body.is_featured = payload.isFeatured;

    const response = await api.patch(`/menu-items/${id}`, body);
    return { data: mapMenuItem(response.data.data?.menuItem ?? response.data.data) };
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<{ data: MenuItem }> => {
    return menuItemApi.update(id, { isAvailable });
  },

  updateAvailability: async (id: string, isAvailable: boolean): Promise<{ data: MenuItem }> => {
    return menuItemApi.update(id, { isAvailable });
  },

  toggleFeatured: async (id: string, isFeatured: boolean): Promise<{ data: MenuItem }> => {
    return menuItemApi.update(id, { isFeatured });
  },

  updateFeatured: async (id: string, isFeatured: boolean): Promise<{ data: MenuItem }> => {
    return menuItemApi.update(id, { isFeatured });
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.delete(`/menu-items/${id}`);
    return { data: { success: true } };
  },
};

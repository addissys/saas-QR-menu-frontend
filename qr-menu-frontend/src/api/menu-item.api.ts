import { AxiosResponse } from 'axios';
import api from './axios';
import { MenuItem } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawMenuItem {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  branch_id?: string;
  branchId?: string;
  branch?: {
    id?: string;
    tenant_id?: string;
  };
  category_id?: string;
  categoryId?: string;
  category?: {
    id?: string;
    name?: string;
  };
  categoryName?: string;
  name?: string;
  description?: string;
  price?: number | string;
  image_url?: string;
  imageUrl?: string;
  is_available?: boolean;
  isAvailable?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
  preparation_time?: number;
  preparationTimeMinutes?: number;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface MenuItemListPayload {
  menuItems?: RawMenuItem[];
  menu_items?: RawMenuItem[];
  items?: RawMenuItem[];
}

interface MenuItemDetailPayload {
  menuItem?: RawMenuItem;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapMenuItem = (item: RawMenuItem): MenuItem => ({
  id: item.id,
  tenantId: item.tenant_id ?? item.tenantId ?? item.branch?.tenant_id ?? '',
  branchId: item.branch_id ?? item.branchId ?? item.branch?.id ?? '',
  categoryId: item.category_id ?? item.categoryId ?? item.category?.id ?? '',
  categoryName: item.category?.name ?? item.categoryName ?? '',
  name: item.name ?? '',
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  imageUrl: item.image_url ?? item.imageUrl,
  isAvailable: item.is_available ?? item.isAvailable ?? true,
  isFeatured: item.is_featured ?? item.isFeatured ?? false,
  preparationTimeMinutes: item.preparation_time ?? item.preparationTimeMinutes,
  createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
});

const unwrapMenuItems = (
  response: AxiosResponse<ApiEnvelope<MenuItemListPayload | RawMenuItem[]>>
): MenuItem[] => {
  const payload = response.data.data ?? response.data;
  const menuItems = Array.isArray(payload)
    ? payload
    : (payload as MenuItemListPayload)?.menuItems ??
      (payload as MenuItemListPayload)?.menu_items ??
      (payload as MenuItemListPayload)?.items;

  return Array.isArray(menuItems) ? menuItems.map(mapMenuItem) : [];
};

const unwrapMenuItem = (
  response: AxiosResponse<ApiEnvelope<MenuItemDetailPayload | RawMenuItem>>
): MenuItem => {
  const payload = response.data.data;
  const raw = (payload as MenuItemDetailPayload)?.menuItem ?? (payload as RawMenuItem);
  return mapMenuItem(raw);
};

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

type CreateMenuItemPayload = Partial<MenuItem> & {
  name: string;
  price: number;
  categoryId: string;
  description: string;
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const menuItemApi = {
  getAll: async (branchId?: string, categoryId?: string, requestedTenantId?: string): Promise<{ data: MenuItem[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const tenantId = requestedTenantId ?? user?.tenantId;

    const params: Record<string, string> = {};
    if (branchId) params.branch_id = branchId;
    if (categoryId) params.category_id = categoryId;
    if (tenantId) params.tenant_id = tenantId;

    const response = await api.get<ApiEnvelope<MenuItemListPayload | RawMenuItem[]>>(
      '/menu-items',
      { params }
    );
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
    const response = await api.get<ApiEnvelope<MenuItemListPayload | RawMenuItem[]>>(
      '/menu-items'
    );
    return { data: unwrapMenuItems(response) };
  },

  getById: async (id: string): Promise<{ data: MenuItem }> => {
    const response = await api.get<ApiEnvelope<MenuItemDetailPayload | RawMenuItem>>(
      `/menu-items/${id}`
    );
    return { data: unwrapMenuItem(response) };
  },

  create: async (payload: CreateMenuItemPayload): Promise<{ data: MenuItem }> => {
    const cleanImageUrl = payload.imageUrl?.trim() ? payload.imageUrl.trim() : undefined;
    const response = await api.post<ApiEnvelope<MenuItemDetailPayload | RawMenuItem>>(
      '/menu-items',
      {
        name: payload.name,
        price: payload.price,
        category_id: payload.categoryId,
        description: payload.description,
        ...(payload.branchId && { branch_id: payload.branchId }),
        ...(cleanImageUrl && { image_url: cleanImageUrl }),
        preparation_time: payload.preparationTimeMinutes,
        is_available: payload.isAvailable ?? true,
        is_featured: payload.isFeatured ?? false,
      }
    );
    return { data: unwrapMenuItem(response) };
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

    const response = await api.patch<ApiEnvelope<MenuItemDetailPayload | RawMenuItem>>(
      `/menu-items/${id}`,
      body
    );
    return { data: unwrapMenuItem(response) };
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
import api from './axios';
import { Branch, Category, MenuItem, Table } from '../types';

const mapBranch = (branch: any): Branch => ({
  id: branch?.id ?? '',
  tenantId: branch?.tenant_id ?? branch?.tenantId ?? branch?.tenant?.id ?? '',
  tenantName: branch?.tenant?.business_name ?? branch?.tenantName ?? '',
  name: branch?.branch_name ?? branch?.name ?? '',
  address: branch?.address ?? '',
  city: branch?.city ?? '',
  phone: branch?.phone ?? '',
  openingHours: branch?.opening_hours ?? branch?.openingHours,
  isActive: branch?.is_active ?? branch?.isActive ?? branch?.status === 'ACTIVE',
  createdAt: branch?.created_at ?? branch?.createdAt ?? new Date().toISOString(),
});

const mapMenuItem = (item: any, categoryId?: string, categoryName?: string): MenuItem => ({
  id: item.id,
  tenantId: item.tenant_id ?? item.tenantId,
  branchId: item.branch_id ?? item.branchId,
  categoryId: item.category_id ?? item.categoryId ?? categoryId ?? '',
  categoryName: item.category?.name ?? categoryName,
  name: item.name ?? '',
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  imageUrl: item.image_url ?? item.imageUrl,
  isAvailable: item.is_available ?? item.isAvailable ?? true,
  isFeatured: item.is_featured ?? item.isFeatured ?? false,
  preparationTimeMinutes: item.preparation_time ?? item.preparationTimeMinutes,
  createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
});

const unwrapBranches = (response: any): Branch[] => {
  const payload = response.data?.data ?? response.data;
  const list = payload?.branches ?? payload;
  return Array.isArray(list) ? list.map(mapBranch) : [];
};

export const publicMenuApi = {
  getPublicBranches: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get('/public/branches');
    return { data: unwrapBranches(response) };
  },

  getBranchPublic: async (branchId: string): Promise<{ data: Branch }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    const raw =
      response.data?.data?.menu?.branch ??
      response.data?.data?.menu ??
      response.data?.data?.branch ??
      response.data?.data;
    return { data: mapBranch(raw) };
  },

  getTableMenuPublic: async (
    tableId: string,
    branchId?: string
  ): Promise<{
    data: {
      branch: Branch;
      table: Table;
      categories: Category[];
      menuItems: MenuItem[];
    };
  }> => {
    const url = branchId
      ? `/public/branches/${branchId}/tables/${tableId}/menu`
      : `/public/tables/${tableId}/menu`;
    const response = await api.get(url);
    const tableRaw = response.data?.data?.menu ?? response.data?.data;
    const branchRaw = tableRaw?.branch;
    const tenantRaw = branchRaw?.tenant;

    const branch: Branch = mapBranch({
      ...branchRaw,
      tenant: tenantRaw,
      tenant_name: tenantRaw?.business_name,
    });

    const table: Table = {
      id: tableRaw?.id ?? tableId,
      branchId: branchRaw?.id ?? branchId ?? '',
      tableNumber: tableRaw?.table_number ?? '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const categoriesRaw = branchRaw?.categories ?? [];
    const categories: Category[] = [];
    const menuItems: MenuItem[] = [];

    if (Array.isArray(categoriesRaw)) {
      categoriesRaw.forEach((cat: any) => {
        categories.push({
          id: cat.id,
          branchId: branch.id,
          name: cat.name,
          description: cat.description,
          displayOrder: cat.sort_order ?? 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        });

        if (Array.isArray(cat.menu_items)) {
          cat.menu_items.forEach((item: any) => {
            menuItems.push(mapMenuItem(item, cat.id, cat.name));
          });
        }
      });
    }

    return {
      data: {
        branch,
        table,
        categories,
        menuItems,
      },
    };
  },

  getTablePublic: async (tableId: string): Promise<{ data: Table }> => {
    const response = await api.get(`/tables/${tableId}`);
    const raw = response.data?.data?.table ?? response.data?.data ?? response.data;
    return {
      data: {
        id: raw?.id,
        branchId: raw?.branch_id ?? raw?.branchId ?? '',
        tableNumber: raw?.table_number ?? raw?.tableNumber ?? '',
        seatingCapacity: raw?.seating_capacity ?? raw?.seatingCapacity,
        capacity: raw?.seating_capacity ?? raw?.capacity,
        section: raw?.section,
        qrCodeUrl: raw?.qr_code_url ?? raw?.qrCodeUrl,
        isActive: raw?.is_active ?? raw?.isActive ?? true,
        createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
      },
    };
  },

  getBranchCategories: async (branchId: string): Promise<{ data: Category[] }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    const menuObj =
      response.data?.data?.menu?.branch ??
      response.data?.data?.menu ??
      response.data?.data?.branch ??
      response.data?.data;
    const raw = menuObj?.categories ?? [];
    const categories: Category[] = Array.isArray(raw)
      ? raw.map((c: any) => ({
          id: c.id,
          branchId: c.branch_id ?? branchId,
          name: c.name,
          description: c.description,
          displayOrder: c.sort_order ?? c.sortOrder ?? c.displayOrder ?? 0,
          sort_order: c.sort_order ?? c.sortOrder,
          isActive: c.is_active ?? true,
          createdAt: c.created_at ?? new Date().toISOString(),
        }))
      : [];
    return { data: categories };
  },

  getBranchMenuItems: async (branchId: string): Promise<{ data: MenuItem[] }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    const menuObj =
      response.data?.data?.menu?.branch ??
      response.data?.data?.menu ??
      response.data?.data?.branch ??
      response.data?.data;
    const categories = menuObj?.categories ?? [];
    const items: MenuItem[] = [];

    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        if (Array.isArray(cat.menu_items)) {
          cat.menu_items.forEach((item: any) => {
            items.push(mapMenuItem(item, cat.id, cat.name));
          });
        }
      });
    }

    if (items.length === 0 && Array.isArray(menuObj?.menu_items)) {
      menuObj.menu_items.forEach((item: any) => {
        items.push(mapMenuItem(item));
      });
    }

    return { data: items };
  },
};

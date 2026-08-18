import { mockStore } from '../services/mockStore';
import { MenuItem } from '../types';

export const menuItemApi = {
  getAll: async (branchId?: string, categoryId?: string): Promise<{ data: MenuItem[] }> => {
    let list = mockStore.menuItems;
    if (branchId) {
      list = list.filter((item) => item.branchId === branchId);
    }
    if (categoryId) {
      list = list.filter((item) => item.categoryId === categoryId);
    }
    return { data: list };
  },

  getAllGlobal: async (): Promise<{ data: MenuItem[] }> => {
    return { data: mockStore.menuItems };
  },

  getById: async (id: string): Promise<{ data: MenuItem }> => {
    const item = mockStore.menuItems.find((i) => i.id === id) || mockStore.menuItems[0];
    return { data: item };
  },

  create: async (payload: Partial<MenuItem> & { name: string; price: number; categoryId: string; description: string }): Promise<{ data: MenuItem }> => {
    const category = mockStore.categories.find((c) => c.id === payload.categoryId);
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      categoryName: category ? category.name : 'General',
      isAvailable: true,
      isFeatured: false,
      branchId: mockStore.branches[0]?.id || 'branch-1',
      tenantId: mockStore.tenant.id,
      ...payload,
    };
    mockStore.menuItems = [...mockStore.menuItems, newItem];
    return { data: newItem };
  },

  update: async (id: string, payload: Partial<MenuItem>): Promise<{ data: MenuItem }> => {
    const list = mockStore.menuItems.map((item) => (item.id === id ? { ...item, ...payload } : item));
    mockStore.menuItems = list;
    const updated = list.find((item) => item.id === id)!;
    return { data: updated };
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
    mockStore.menuItems = mockStore.menuItems.filter((i) => i.id !== id);
    return { data: { success: true } };
  },
};

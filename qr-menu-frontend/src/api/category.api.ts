import { mockStore } from '../services/mockStore';
import { Category } from '../types';

export const categoryApi = {
  getAll: async (branchId?: string): Promise<{ data: Category[] }> => {
    let list = mockStore.categories;
    if (branchId) {
      list = list.filter((c) => c.branchId === branchId);
    }
    return { data: list };
  },

  create: async (payload: Partial<Category> & { name: string; displayOrder: number }): Promise<{ data: Category }> => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      branchId: mockStore.branches[0]?.id || 'branch-1',
      ...payload,
    };
    mockStore.categories = [...mockStore.categories, newCat];
    return { data: newCat };
  },

  update: async (id: string, payload: Partial<Category>): Promise<{ data: Category }> => {
    const list = mockStore.categories.map((c) => (c.id === id ? { ...c, ...payload } : c));
    mockStore.categories = list;
    const updated = list.find((c) => c.id === id)!;
    return { data: updated };
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    mockStore.categories = mockStore.categories.filter((c) => c.id !== id);
    return { data: { success: true } };
  },
};

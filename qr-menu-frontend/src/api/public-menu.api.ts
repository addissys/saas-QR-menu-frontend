import { mockStore } from '../services/mockStore';
import { Branch, Category, MenuItem, Table } from '../types';

export const publicMenuApi = {
  getPublicBranches: async (): Promise<{ data: Branch[] }> => {
    return { data: mockStore.branches.filter((b) => b.isActive) };
  },

  getBranchPublic: async (branchId: string): Promise<{ data: Branch }> => {
    const branch = mockStore.branches.find((b) => b.id === branchId) || mockStore.branches[0];
    return { data: branch };
  },

  getTablePublic: async (tableId: string): Promise<{ data: Table }> => {
    const table = mockStore.tables.find((t) => t.id === tableId) || mockStore.tables[0];
    return { data: table };
  },

  getBranchCategories: async (branchId: string): Promise<{ data: Category[] }> => {
    return { data: mockStore.categories.filter((c) => c.branchId === branchId && c.isActive) };
  },

  getBranchMenuItems: async (branchId: string): Promise<{ data: MenuItem[] }> => {
    return { data: mockStore.menuItems.filter((m) => m.branchId === branchId) };
  },
};

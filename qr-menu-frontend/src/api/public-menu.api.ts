import api from './axios';
import { Branch, Category, MenuItem, Table } from '../types';

export const publicMenuApi = {
  getPublicBranches: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get('/public/branches');
    return response.data;
  },

  getBranchPublic: async (branchId: string): Promise<{ data: Branch }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    return { data: response.data.data?.branch || response.data.data };
  },

  getTablePublic: async (tableId: string): Promise<{ data: Table }> => {
    const response = await api.get(`/tables/${tableId}`);
    return response.data;
  },

  getBranchCategories: async (branchId: string): Promise<{ data: Category[] }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    return { data: response.data.data?.categories || [] };
  },

  getBranchMenuItems: async (branchId: string): Promise<{ data: MenuItem[] }> => {
    const response = await api.get(`/public/branches/${branchId}/menu`);
    return { data: response.data.data?.menu_items || response.data.data?.items || [] };
  },
};

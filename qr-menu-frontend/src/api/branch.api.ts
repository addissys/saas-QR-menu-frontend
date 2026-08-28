import api from './axios';
import { Branch } from '../types';

export const branchApi = {
  getAll: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get('/branches');
    return response.data;
  },

  getAllGlobal: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get('/branches');
    return response.data;
  },

  getById: async (id: string): Promise<{ data: Branch }> => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  create: async (payload: Partial<Branch> & { name: string; address: string; phone: string }): Promise<{ data: Branch }> => {
    const response = await api.post('/branches', payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<Branch>): Promise<{ data: Branch }> => {
    const response = await api.patch(`/branches/${id}`, payload);
    return response.data;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ data: Branch }> => {
    return branchApi.update(id, { isActive });
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};

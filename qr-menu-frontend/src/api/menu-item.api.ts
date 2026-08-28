import api from './axios';
import { MenuItem } from '../types';

export const menuItemApi = {
  getAll: async (branchId?: string, categoryId?: string): Promise<{ data: MenuItem[] }> => {
    const params: Record<string, string> = {};
    if (branchId) params.branch_id = branchId;
    if (categoryId) params.category_id = categoryId;
    
    const response = await api.get('/menu-items', { params });
    return response.data;
  },

  getAllGlobal: async (): Promise<{ data: MenuItem[] }> => {
    const response = await api.get('/menu-items');
    return response.data;
  },

  getById: async (id: string): Promise<{ data: MenuItem }> => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  create: async (payload: Partial<MenuItem> & { name: string; price: number; categoryId: string; description: string }): Promise<{ data: MenuItem }> => {
    const body = {
      name: payload.name,
      price: payload.price,
      category_id: payload.categoryId,
      description: payload.description,
      branch_id: payload.branchId,
      image_url: payload.imageUrl,
      is_available: payload.isAvailable ?? true,
      is_featured: payload.isFeatured ?? false,
    };
    const response = await api.post('/menu-items', body);
    return response.data;
  },

  update: async (id: string, payload: Partial<MenuItem>): Promise<{ data: MenuItem }> => {
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.price !== undefined) body.price = payload.price;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
    if (payload.imageUrl !== undefined) body.image_url = payload.imageUrl;
    if (payload.isAvailable !== undefined) body.is_available = payload.isAvailable;
    if (payload.isFeatured !== undefined) body.is_featured = payload.isFeatured;

    const response = await api.patch(`/menu-items/${id}`, body);
    return response.data;
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
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  },
};

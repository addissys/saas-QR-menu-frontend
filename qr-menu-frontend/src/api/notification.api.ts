import api from './axios';
import { Notification } from '../types';

export const notificationApi = {
  getAll: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ data: { success: boolean } }> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ data: { success: boolean } }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAll: async (): Promise<{ data: { success: boolean } }> => {
    // Delete iteratively or via backend clear route if supported
    const allRes = await api.get('/notifications');
    const notifs: Notification[] = allRes.data.data || [];
    await Promise.all(notifs.map((n) => api.delete(`/notifications/${n.id}`)));
    return { data: { success: true } };
  },

  deleteSelected: async (ids: string[]): Promise<{ data: { success: boolean } }> => {
    await Promise.all(ids.map((id) => api.delete(`/notifications/${id}`)));
    return { data: { success: true } };
  },

  restoreSample: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get('/notifications');
    return response.data;
  },
};

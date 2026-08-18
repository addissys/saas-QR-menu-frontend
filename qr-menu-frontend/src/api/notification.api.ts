import { mockStore, INITIAL_NOTIFICATIONS } from '../services/mockStore';
import { Notification } from '../types';

export const notificationApi = {
  getAll: async (): Promise<{ data: Notification[] }> => {
    return { data: mockStore.notifications };
  },

  markAsRead: async (id: string): Promise<{ data: { success: boolean } }> => {
    mockStore.notifications = mockStore.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return { data: { success: true } };
  },

  markAllAsRead: async (): Promise<{ data: { success: boolean } }> => {
    mockStore.notifications = mockStore.notifications.map((n) => ({ ...n, isRead: true }));
    return { data: { success: true } };
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    mockStore.notifications = mockStore.notifications.filter((n) => n.id !== id);
    return { data: { success: true } };
  },

  deleteAll: async (): Promise<{ data: { success: boolean } }> => {
    mockStore.notifications = [];
    return { data: { success: true } };
  },

  deleteSelected: async (ids: string[]): Promise<{ data: { success: boolean } }> => {
    const idSet = new Set(ids);
    mockStore.notifications = mockStore.notifications.filter((n) => !idSet.has(n.id));
    return { data: { success: true } };
  },

  restoreSample: async (): Promise<{ data: Notification[] }> => {
    mockStore.notifications = [...INITIAL_NOTIFICATIONS];
    return { data: mockStore.notifications };
  },
};

import api from './axios';
import { Notification } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const mapNotification = (n: any): Notification => ({
  id: n.id,
  tenantId: n.tenant_id ?? n.tenantId ?? '',
  title: n.title ?? '',
  message: n.message ?? '',
  type: (n.type === 'SYSTEM' || n.type === 'BRANCH' || n.type === 'MENU' || n.type === 'PROMOTION')
    ? 'INFO'
    : (n.type ?? 'INFO'),
  isRead: n.is_read ?? n.isRead ?? false,
  createdAt: n.sent_at ?? n.created_at ?? n.createdAt ?? new Date().toISOString(),
});

const unwrapNotifications = (response: any): Notification[] => {
  const payload = response.data?.data ?? response.data;
  const list = payload?.notifications ?? payload?.data ?? payload;
  return Array.isArray(list) ? list.map(mapNotification) : [];
};

export const notificationApi = {
  getAll: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get('/notifications', { params: { limit: 100 } });
    return { data: unwrapNotifications(response) };
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
    const allRes = await notificationApi.getAll();
    const notifs = allRes.data || [];
    await Promise.all(notifs.map((n) => api.delete(`/notifications/${n.id}`).catch(() => {})));
    return { data: { success: true } };
  },

  deleteSelected: async (ids: string[]): Promise<{ data: { success: boolean } }> => {
    await Promise.all(ids.map((id) => api.delete(`/notifications/${id}`).catch(() => {})));
    return { data: { success: true } };
  },

  restoreSample: async (): Promise<{ data: Notification[] }> => {
    const user = useAuthStore.getState().user;
    if (user?.id) {
      const samples = [
        {
          user_id: user.id,
          title: 'Table 4 QR Code Scanned',
          message: 'A guest scanned Table 4 QR menu at Main Branch.',
          type: 'TABLE_SERVICE',
        },
        {
          user_id: user.id,
          title: 'Low Inventory Alert',
          message: 'Espresso coffee beans stock running low at Downtown location.',
          type: 'ALERT',
        },
        {
          user_id: user.id,
          title: 'System Update Completed',
          message: 'Digital menu platform updated with fast search and filters.',
          type: 'INFO',
        },
      ];

      await Promise.all(samples.map((s) => api.post('/notifications', s).catch(() => {})));
    }
    return notificationApi.getAll();
  },
};

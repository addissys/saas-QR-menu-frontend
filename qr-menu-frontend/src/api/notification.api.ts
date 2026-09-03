import { AxiosResponse } from 'axios';
import api from './axios';
import { Notification } from '../types';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawNotification {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  isRead?: boolean;
  sent_at?: string;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface NotificationListPayload {
  notifications?: RawNotification[];
  data?: RawNotification[];
}

interface SuccessPayload {
  success: boolean;
}

interface CreateNotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapNotification = (n: RawNotification): Notification => ({
  id: n.id,
  tenantId: n.tenant_id ?? n.tenantId ?? '',
  title: n.title ?? '',
  message: n.message ?? '',
  type:
    n.type === 'SYSTEM' || n.type === 'BRANCH' || n.type === 'MENU' || n.type === 'PROMOTION'
      ? 'INFO'
      : (n.type as Notification['type']) ?? 'INFO',
  isRead: n.is_read ?? n.isRead ?? false,
  createdAt: n.sent_at ?? n.created_at ?? n.createdAt ?? new Date().toISOString(),
});

const unwrapNotifications = (
  response: AxiosResponse<ApiEnvelope<NotificationListPayload | RawNotification[]>>
): Notification[] => {
  const payload = response.data.data ?? response.data;
  const list = Array.isArray(payload)
    ? payload
    : (payload as NotificationListPayload)?.notifications ??
      (payload as NotificationListPayload)?.data;

  return Array.isArray(list) ? list.map(mapNotification) : [];
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const notificationApi = {
  getAll: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get<ApiEnvelope<NotificationListPayload | RawNotification[]>>(
      '/notifications',
      { params: { limit: 100 } }
    );
    return { data: unwrapNotifications(response) };
  },

  markAsRead: async (id: string): Promise<{ data: SuccessPayload }> => {
    const response = await api.patch<{ data: SuccessPayload }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ data: SuccessPayload }> => {
    const response = await api.patch<{ data: SuccessPayload }>('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<{ data: SuccessPayload }> => {
    const response = await api.delete<{ data: SuccessPayload }>(`/notifications/${id}`);
    return response.data;
  },

  deleteAll: async (): Promise<{ data: SuccessPayload }> => {
    const allRes = await notificationApi.getAll();
    const notifs = allRes.data || [];
    await Promise.all(
      notifs.map((n) => api.delete(`/notifications/${n.id}`).catch(() => {}))
    );
    return { data: { success: true } };
  },

  deleteSelected: async (ids: string[]): Promise<{ data: SuccessPayload }> => {
    await Promise.all(ids.map((id) => api.delete(`/notifications/${id}`).catch(() => {})));
    return { data: { success: true } };
  },

  restoreSample: async (): Promise<{ data: Notification[] }> => {
    const user = useAuthStore.getState().user;
    if (user?.id) {
      const samples: CreateNotificationPayload[] = [
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
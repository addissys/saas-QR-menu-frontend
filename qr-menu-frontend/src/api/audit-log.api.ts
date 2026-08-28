import api from './axios';
import { AuditLog } from '../types';

export const auditLogApi = {
  getAll: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get('/audit-logs');
    return response.data;
  },

  getAllGlobal: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get('/audit-logs');
    return response.data;
  },
};

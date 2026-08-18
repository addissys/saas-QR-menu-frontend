import { mockStore } from '../services/mockStore';
import { AuditLog } from '../types';

export const auditLogApi = {
  getAll: async (): Promise<{ data: AuditLog[] }> => {
    return { data: mockStore.auditLogs };
  },

  getAllGlobal: async (): Promise<{ data: AuditLog[] }> => {
    return { data: mockStore.auditLogs };
  },
};

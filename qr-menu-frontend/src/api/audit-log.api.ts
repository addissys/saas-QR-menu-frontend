import api from './axios';
import { AuditLog } from '../types';

const mapAuditLog = (log: any): AuditLog => ({
  id: log.id,
  tenantId: log.tenant_id ?? log.tenantId ?? '',
  userId: log.user_id ?? log.userId ?? log.user?.id,
  userEmail: log.user_email ?? log.userEmail ?? log.user?.email,
  userName: log.user_name ?? log.userName ?? log.user?.full_name,
  action: log.action ?? '',
  entity: log.entity ?? log.entity_type ?? log.module ?? 'record',
  module: log.module ?? log.entity_type ?? 'activity',
  entityName: log.entity_name ?? log.entityName ?? log.entity ?? log.entity_type ?? 'Record',
  details: log.details,
  ipAddress: log.ip_address ?? log.ipAddress,
  createdAt: log.created_at ?? log.createdAt ?? new Date().toISOString(),
});

const unwrapLogs = (response: any): AuditLog[] => {
  const payload = response.data.data ?? response.data;
  const logs = payload.auditLogs ?? payload.logs ?? payload;
  return Array.isArray(logs) ? logs.map(mapAuditLog) : [];
};

export const auditLogApi = {
  getAll: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get('/audit-logs');
    return { data: unwrapLogs(response) };
  },

  getAllGlobal: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get('/audit-logs');
    return { data: unwrapLogs(response) };
  },
};

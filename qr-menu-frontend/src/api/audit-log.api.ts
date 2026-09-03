import { AxiosResponse } from 'axios';
import api from './axios';
import { AuditLog } from '../types';

// ---------------------------------------------------------------------------
// Raw API shape (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawAuditLogUser {
  id?: string;
  email?: string;
  full_name?: string;
}

interface RawAuditLog {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  user_id?: string;
  userId?: string;
  user?: RawAuditLogUser;
  user_email?: string;
  userEmail?: string;
  user_name?: string;
  userName?: string;
  action?: string;
  entity?: string;
  entity_type?: string;
  module?: string;
  entity_name?: string;
  entityName?: string;
  details?: string | Record<string, unknown> | null;
  ip_address?: string;
  ipAddress?: string;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface AuditLogListPayload {
  auditLogs?: RawAuditLog[];
  logs?: RawAuditLog[];
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapAuditLog = (log: RawAuditLog): AuditLog => ({
  id: log.id,
  tenantId: log.tenant_id ?? log.tenantId ?? '',
  userId: log.user_id ?? log.userId ?? log.user?.id,
  userEmail: log.user_email ?? log.userEmail ?? log.user?.email,
  userName: log.user_name ?? log.userName ?? log.user?.full_name,
  action: log.action ?? '',
  entity: log.entity ?? log.entity_type ?? log.module ?? 'record',
  module: log.module ?? log.entity_type ?? 'activity',
  entityName: log.entity_name ?? log.entityName ?? log.entity ?? log.entity_type ?? 'Record',
  details:
    typeof log.details === 'string'
      ? log.details
      : log.details != null
      ? JSON.stringify(log.details)
      : undefined,
  ipAddress: log.ip_address ?? log.ipAddress,
  createdAt: log.created_at ?? log.createdAt ?? new Date().toISOString(),
});

const unwrapLogs = (
  response: AxiosResponse<ApiEnvelope<AuditLogListPayload | RawAuditLog[]>>
): AuditLog[] => {
  const payload = response.data.data ?? response.data;
  const logs = Array.isArray(payload)
    ? payload
    : (payload as AuditLogListPayload)?.auditLogs ?? (payload as AuditLogListPayload)?.logs;

  return Array.isArray(logs) ? logs.map(mapAuditLog) : [];
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const auditLogApi = {
  getAll: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get<ApiEnvelope<AuditLogListPayload | RawAuditLog[]>>(
      '/audit-logs'
    );
    return { data: unwrapLogs(response) };
  },

  getAllGlobal: async (): Promise<{ data: AuditLog[] }> => {
    const response = await api.get<ApiEnvelope<AuditLogListPayload | RawAuditLog[]>>(
      '/audit-logs'
    );
    return { data: unwrapLogs(response) };
  },
};
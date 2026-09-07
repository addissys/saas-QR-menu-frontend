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
  user_role?: string;
  userRole?: string;
  branch_id?: string;
  branchId?: string;
  method?: string;
  endpoint?: string;
  status_code?: number;
  statusCode?: number;
  request_body?: string;
  requestBody?: string;
  response_body?: string;
  responseBody?: string;
  success?: boolean;
  error_message?: string;
  errorMessage?: string;
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
  userRole: log.user_role ?? log.userRole,
  branchId: log.branch_id ?? log.branchId,
  method: log.method,
  endpoint: log.endpoint,
  statusCode: log.status_code ?? log.statusCode,
  requestBody: log.request_body ?? log.requestBody,
  responseBody: log.response_body ?? log.responseBody,
  success: log.success,
  errorMessage: log.error_message ?? log.errorMessage,
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

  getAllGlobal: async (params: Record<string, string | number | boolean | undefined> = {}): Promise<{ data: AuditLog[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
    const response = await api.get('/audit-logs', { params });
    const payload = response.data?.data ?? {};
    return {
      data: unwrapLogs(response),
      pagination: payload.pagination,
    };
  },

  getById: async (id: string): Promise<AuditLog> => {
    const response = await api.get(`/audit-logs/${id}`);
    return mapAuditLog(response.data?.data?.auditLog ?? response.data?.data);
  },
};
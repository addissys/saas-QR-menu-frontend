import { AxiosResponse } from 'axios';
import api from './axios';
import { Table } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawTable {
  id: string;
  branch_id?: string;
  branchId?: string;
  table_number?: string;
  tableNumber?: string;
  seating_capacity?: number;
  seatingCapacity?: number;
  capacity?: number;
  section?: string;
  qr_code_url?: string;
  qrCodeUrl?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface TableListPayload {
  tables?: RawTable[];
}

interface TableDetailPayload {
  table?: RawTable;
}

type CreateTablePayload = Omit<Table, 'id' | 'createdAt'>;

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapTable = (table: RawTable): Table => ({
  id: table.id,
  branchId: table.branch_id ?? table.branchId ?? '',
  tableNumber: table.table_number ?? table.tableNumber ?? '',
  seatingCapacity: table.seating_capacity ?? table.seatingCapacity,
  capacity: table.seating_capacity ?? table.capacity,
  section: table.section,
  qrCodeUrl: table.qr_code_url ?? table.qrCodeUrl,
  isActive: table.is_active ?? table.isActive ?? true,
  createdAt: table.created_at ?? table.createdAt ?? new Date().toISOString(),
});

const unwrapTables = (
  response: AxiosResponse<ApiEnvelope<TableListPayload | RawTable[]>>
): Table[] => {
  const payload = response.data.data ?? response.data;
  const tables = Array.isArray(payload) ? payload : (payload as TableListPayload)?.tables;
  return Array.isArray(tables) ? tables.map(mapTable) : [];
};

const unwrapTable = (
  response: AxiosResponse<ApiEnvelope<TableDetailPayload | RawTable>>
): Table => {
  const payload = response.data.data;
  const raw = (payload as TableDetailPayload)?.table ?? (payload as RawTable);
  return mapTable(raw);
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const tableApi = {
  getAll: async (branchId?: string, tenantId?: string): Promise<{ data: Table[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (branchId || tenantId) {
      const response = await api.get<ApiEnvelope<TableListPayload | RawTable[]>>('/tables', {
        params: { ...(branchId && { branch_id: branchId }), ...(tenantId && { tenant_id: tenantId }) },
      });
      return { data: unwrapTables(response) };
    }

    const response = await api.get<ApiEnvelope<TableListPayload | RawTable[]>>('/tables');
    const tables = unwrapTables(response);

    // Tenant isolation: filter tables by branches belonging to the logged-in user's tenant
    if (!isSuperAdmin && user?.tenantId) {
      const userBranchesRes = await branchApi.getAll();
      const userBranchIds = new Set(userBranchesRes.data.map((b) => b.id));
      return { data: tables.filter((t) => userBranchIds.has(t.branchId)) };
    }

    return { data: tables };
  },

  getById: async (id: string): Promise<{ data: Table }> => {
    const response = await api.get<ApiEnvelope<TableDetailPayload | RawTable>>(`/tables/${id}`);
    return { data: unwrapTable(response) };
  },

  create: async (payload: CreateTablePayload): Promise<{ data: Table }> => {
    const response = await api.post<ApiEnvelope<TableDetailPayload | RawTable>>('/tables', {
      branch_id: payload.branchId,
      table_number: payload.tableNumber,
      seating_capacity: payload.seatingCapacity ?? payload.capacity,
      section: payload.section,
      is_active: payload.isActive,
    });
    return { data: unwrapTable(response) };
  },

  update: async (id: string, payload: Partial<Table>): Promise<{ data: Table }> => {
    const response = await api.patch<ApiEnvelope<TableDetailPayload | RawTable>>(
      `/tables/${id}`,
      {
        ...(payload.tableNumber !== undefined && { table_number: payload.tableNumber }),
        ...(payload.seatingCapacity !== undefined && {
          seating_capacity: payload.seatingCapacity,
        }),
        ...(payload.capacity !== undefined && { seating_capacity: payload.capacity }),
        ...(payload.section !== undefined && { section: payload.section }),
        ...(payload.isActive !== undefined && { is_active: payload.isActive }),
      }
    );
    return { data: unwrapTable(response) };
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.delete(`/tables/${id}`);
    return { data: { success: true } };
  },
};
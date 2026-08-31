import api from './axios';
import { Table } from '../types';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

const mapTable = (table: any): Table => ({
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

export const tableApi = {
  getAll: async (branchId?: string): Promise<{ data: Table[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (branchId) {
      const response = await api.get('/tables', { params: { branch_id: branchId } });
      const payload = response.data.data ?? response.data;
      const tables = payload.tables ?? payload;
      return { data: Array.isArray(tables) ? tables.map(mapTable) : [] };
    }

    const response = await api.get('/tables');
    const payload = response.data.data ?? response.data;
    const tables: Table[] = Array.isArray(payload.tables ?? payload)
      ? (payload.tables ?? payload).map(mapTable)
      : [];

    // Tenant isolation: filter tables by branches belonging to the logged-in user's tenant
    if (!isSuperAdmin && user?.tenantId) {
      const userBranchesRes = await branchApi.getAll();
      const userBranchIds = new Set(userBranchesRes.data.map((b) => b.id));
      return { data: tables.filter((t) => userBranchIds.has(t.branchId)) };
    }

    return { data: tables };
  },

  getById: async (id: string): Promise<{ data: Table }> => {
    const response = await api.get(`/tables/${id}`);
    return { data: mapTable(response.data.data?.table ?? response.data.data) };
  },

  create: async (payload: Omit<Table, 'id' | 'createdAt'>): Promise<{ data: Table }> => {
    const response = await api.post('/tables', {
      branch_id: payload.branchId,
      table_number: payload.tableNumber,
      seating_capacity: payload.seatingCapacity ?? payload.capacity,
      section: payload.section,
      is_active: payload.isActive,
    });
    return { data: mapTable(response.data.data?.table ?? response.data.data) };
  },

  update: async (id: string, payload: Partial<Table>): Promise<{ data: Table }> => {
    const response = await api.patch(`/tables/${id}`, {
      ...(payload.tableNumber !== undefined && { table_number: payload.tableNumber }),
      ...(payload.seatingCapacity !== undefined && { seating_capacity: payload.seatingCapacity }),
      ...(payload.capacity !== undefined && { seating_capacity: payload.capacity }),
      ...(payload.section !== undefined && { section: payload.section }),
      ...(payload.isActive !== undefined && { is_active: payload.isActive }),
    });
    return { data: mapTable(response.data.data?.table ?? response.data.data) };
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.delete(`/tables/${id}`);
    return { data: { success: true } };
  },
};

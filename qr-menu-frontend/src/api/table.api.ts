import { mockStore } from '../services/mockStore';
import { Table } from '../types';

export const tableApi = {
  getAll: async (branchId?: string): Promise<{ data: Table[] }> => {
    let list = mockStore.tables;
    if (branchId) {
      list = list.filter((t) => t.branchId === branchId);
    }
    return { data: list };
  },

  getById: async (id: string): Promise<{ data: Table }> => {
    const table = mockStore.tables.find((t) => t.id === id) || mockStore.tables[0];
    return { data: table };
  },

  create: async (payload: Omit<Table, 'id' | 'createdAt'>): Promise<{ data: Table }> => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    mockStore.tables = [...mockStore.tables, newTable];
    return { data: newTable };
  },

  update: async (id: string, payload: Partial<Table>): Promise<{ data: Table }> => {
    const tables = mockStore.tables.map((t) => (t.id === id ? { ...t, ...payload } : t));
    mockStore.tables = tables;
    const updated = tables.find((t) => t.id === id)!;
    return { data: updated };
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    mockStore.tables = mockStore.tables.filter((t) => t.id !== id);
    return { data: { success: true } };
  },
};

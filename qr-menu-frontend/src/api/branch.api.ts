import { mockStore } from '../services/mockStore';
import { Branch } from '../types';

export const branchApi = {
  getAll: async (): Promise<{ data: Branch[] }> => {
    return { data: mockStore.branches };
  },

  getAllGlobal: async (): Promise<{ data: Branch[] }> => {
    return { data: mockStore.branches };
  },

  getById: async (id: string): Promise<{ data: Branch }> => {
    const branch = mockStore.branches.find((b) => b.id === id) || mockStore.branches[0];
    return { data: branch };
  },

  create: async (payload: Partial<Branch> & { name: string; address: string; phone: string }): Promise<{ data: Branch }> => {
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      tenantId: mockStore.tenant.id,
      createdAt: new Date().toISOString(),
      isActive: true,
      ...payload,
    };
    mockStore.branches = [...mockStore.branches, newBranch];
    return { data: newBranch };
  },

  update: async (id: string, payload: Partial<Branch>): Promise<{ data: Branch }> => {
    const branches = mockStore.branches.map((b) => (b.id === id ? { ...b, ...payload } : b));
    mockStore.branches = branches;
    const updated = branches.find((b) => b.id === id)!;
    return { data: updated };
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ data: Branch }> => {
    return branchApi.update(id, { isActive });
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    mockStore.branches = mockStore.branches.filter((b) => b.id !== id);
    return { data: { success: true } };
  },
};

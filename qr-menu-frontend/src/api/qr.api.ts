import { mockStore } from '../services/mockStore';
import { QRCodeConfig } from '../types';

export const qrApi = {
  getAll: async (): Promise<{ data: QRCodeConfig[] }> => {
    return { data: [] };
  },

  generate: async (config: {
    branchId: string;
    tableId?: string;
    fgColor?: string;
    bgColor?: string;
    size?: number;
  }): Promise<{ data: QRCodeConfig & { url: string } }> => {
    const targetUrl = config.tableId
      ? `${window.location.origin}/public/branches/${config.branchId}/tables/${config.tableId}/menu`
      : `${window.location.origin}/public/branches/${config.branchId}/menu`;

    const qr: QRCodeConfig & { url: string } = {
      id: `qr-${Date.now()}`,
      branchId: config.branchId,
      tableId: config.tableId,
      targetUrl,
      url: targetUrl,
      fgColor: config.fgColor || '#0f172a',
      bgColor: config.bgColor || '#ffffff',
      size: config.size || 300,
      createdAt: new Date().toISOString(),
    };

    return { data: qr };
  },
};

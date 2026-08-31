import api from './axios';
import { QRCodeConfig } from '../types';

const mapQr = (payload: any): QRCodeConfig => {
  const qr = payload.qr ?? payload;
  const table = payload.table ?? qr.table;
  const publicUrl = qr.public_url ?? qr.publicUrl ?? qr.targetUrl ?? qr.url ?? '';

  return {
    id: qr.id ?? table?.id ?? `qr-${Date.now()}`,
    tableId: qr.table_id ?? qr.tableId ?? table?.id,
    branchId: table?.branch_id ?? table?.branch?.id ?? qr.branch_id ?? qr.branchId ?? '',
    targetUrl: publicUrl,
    publicUrl,
    branchName: table?.branch?.branch_name ?? table?.branchName,
    tableNumber: table?.table_number ?? table?.tableNumber,
    status: (qr.is_active ?? qr.isActive ?? true) ? 'ACTIVE' : 'DEACTIVATED',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    size: 300,
    createdAt: qr.created_at ?? qr.createdAt ?? new Date().toISOString(),
  };
};

export const qrApi = {
  getAll: async (): Promise<{ data: QRCodeConfig[] }> => {
    const response = await api.get('/qr-codes');
    const payload = response.data.data ?? response.data;
    return { data: Array.isArray(payload) ? payload.map(mapQr) : [] };
  },

  generate: async (config: {
    branchId: string;
    tableId?: string;
    fgColor?: string;
    bgColor?: string;
    size?: number;
  }): Promise<{ data: QRCodeConfig & { url: string } }> => {
    if (!config.tableId) {
      const publicUrl = `${window.location.origin}/public/branches/${config.branchId}/menu`;
      return {
        data: {
          id: `branch-${config.branchId}`,
          branchId: config.branchId,
          targetUrl: publicUrl,
          publicUrl,
          url: publicUrl,
          status: 'ACTIVE',
          fgColor: config.fgColor || '#0f172a',
          bgColor: config.bgColor || '#ffffff',
          size: config.size || 300,
          createdAt: new Date().toISOString(),
        },
      };
    }

    const response = await api.post('/qr-codes/generate', { table_id: config.tableId });
    const qr = mapQr(response.data.data);
    return { data: { ...qr, url: qr.publicUrl } };
  },
};

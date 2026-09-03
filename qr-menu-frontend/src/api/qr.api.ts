import api from './axios';
import { QRCodeConfig } from '../types';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawQrBranch {
  branch_name?: string;
  branchName?: string;
}

interface RawQrTable {
  id?: string;
  branch_id?: string;
  branchId?: string;
  branch?: RawQrBranch & { id?: string };
  branch_name?: string;
  branchName?: string;
  table_number?: string;
  tableNumber?: string;
}

interface RawQr {
  id?: string;
  table_id?: string;
  tableId?: string;
  branch_id?: string;
  branchId?: string;
  public_url?: string;
  publicUrl?: string;
  targetUrl?: string;
  url?: string;
  table?: RawQrTable;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

/** The endpoint sometimes wraps the QR under `qr`/`table`, sometimes returns it flat. */
interface RawQrResponse extends RawQr {
  qr?: RawQr;
  table?: RawQrTable;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface GenerateQrPayload {
  branchId: string;
  tableId?: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapQr = (payload: RawQrResponse): QRCodeConfig => {
  const qr: RawQr = payload.qr ?? payload;
  const table: RawQrTable | undefined = payload.table ?? qr.table;
  const publicUrl = qr.public_url ?? qr.publicUrl ?? qr.targetUrl ?? qr.url ?? '';

  return {
    id: qr.id ?? table?.id ?? `qr-${Date.now()}`,
    tableId: qr.table_id ?? qr.tableId ?? table?.id,
    branchId: table?.branch_id ?? table?.branch?.id ?? qr.branch_id ?? qr.branchId ?? '',
    targetUrl: publicUrl,
    publicUrl,
    branchName: table?.branch?.branch_name ?? table?.branch?.branchName ?? table?.branchName,
    tableNumber: table?.table_number ?? table?.tableNumber,
    status: (qr.is_active ?? qr.isActive ?? true) ? 'ACTIVE' : 'DEACTIVATED',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    size: 300,
    createdAt: qr.created_at ?? qr.createdAt ?? new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const qrApi = {
  getAll: async (): Promise<{ data: QRCodeConfig[] }> => {
    const response = await api.get<ApiEnvelope<RawQrResponse[]> | RawQrResponse[]>('/qr-codes');
    const payload = (response.data as ApiEnvelope<RawQrResponse[]>).data ?? response.data;
    const list = payload as RawQrResponse[];
    return { data: Array.isArray(list) ? list.map(mapQr) : [] };
  },

  generate: async (
    config: GenerateQrPayload
  ): Promise<{ data: QRCodeConfig & { url: string } }> => {
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

    const response = await api.post<ApiEnvelope<RawQrResponse>>('/qr-codes/generate', {
      table_id: config.tableId,
    });
    const qr = mapQr(response.data.data ?? {});
    return { data: { ...qr, url: qr.publicUrl } };
  },
};
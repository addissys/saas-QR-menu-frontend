import React from 'react';
import { QRCodeData } from '../../types';
import { QRPreview } from './QRPreview';
import { Download, ExternalLink, Power, RefreshCw, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import QRCode from 'qrcode';

interface QRCardProps {
  qr: QRCodeData;
  onToggleStatus: (id: string, status: 'ACTIVE' | 'DEACTIVATED') => void;
  onRegenerate: (tableId: string) => void;
  onOpenPdfStudio?: (branchId?: string, tableId?: string) => void;
}

export const QRCard: React.FC<QRCardProps> = ({ qr, onToggleStatus, onRegenerate, onOpenPdfStudio }) => {
  const handleDownload = async () => {
    try {
      const canvasUrl = await QRCode.toDataURL(qr.publicUrl, {
        width: 600,
        margin: 3,
      });
      const link = document.createElement('a');
      link.href = canvasUrl;
      link.download = `QR-${qr.branchName || 'Branch'}-${qr.tableNumber}.png`;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-4 hover:border-purple-200 transition-all">
      <div className="flex items-center justify-between w-full">
        <Badge variant={qr.status === 'ACTIVE' ? 'success' : 'danger'}>
          {qr.status}
        </Badge>
        <span className="text-xs text-slate-500 font-medium">{qr.branchName || 'Main Branch'}</span>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center">
        <QRPreview url={qr.publicUrl} size={160} />
        <p className="mt-2 text-xs font-bold text-slate-800 tracking-wider uppercase">
          Scan to View Menu
        </p>
        <p className="text-sm font-semibold text-purple-700">{qr.tableNumber}</p>
      </div>

      <div className="w-full space-y-2 pt-2 border-t border-slate-100">
        <a
          href={qr.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium py-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Test Public Link
        </a>

        {onOpenPdfStudio && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon={Printer}
            onClick={() => onOpenPdfStudio(qr.branchId, qr.tableId)}
            className="text-purple-700 border-purple-200 hover:bg-purple-50 font-bold"
          >
            PDF Menu Card
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>
            Save PNG
          </Button>
          <Button
            variant={qr.status === 'ACTIVE' ? 'outline' : 'primary'}
            size="sm"
            icon={Power}
            onClick={() => onToggleStatus(qr.id, qr.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE')}
          >
            {qr.status === 'ACTIVE' ? 'Disable' : 'Enable'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          icon={RefreshCw}
          onClick={() => onRegenerate(qr.tableId)}
        >
          Regenerate QR
        </Button>
      </div>
    </div>
  );
};

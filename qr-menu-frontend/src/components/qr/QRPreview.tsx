import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ExternalLink, Printer, Copy, Check, FileCode2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface QRPreviewProps {
  url: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
  tableName?: string;
  branchName?: string;
  errorCorrectionLevel?: QRCode.QRCodeErrorCorrectionLevel;
  onOpenPdfStudio?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  url,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  size = 220,
  tableName,
  branchName,
  errorCorrectionLevel = 'M',
  onOpenPdfStudio,
}) => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      setIsRendering(true);
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: size,
          margin: 2,
          errorCorrectionLevel: errorCorrectionLevel as QRCode.QRCodeErrorCorrectionLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        }
      )
        .then(() => setIsRendering(false))
        .catch((error) => {
          setIsRendering(false);
          console.error('QR Render error:', error);
        });
    }
  }, [url, fgColor, bgColor, size, errorCorrectionLevel]);

  const handleDownloadPng = async () => {
    try {
      // Generate crisp 800x800 high-res image
      const highResDataUrl = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel as QRCode.QRCodeErrorCorrectionLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      const link = document.createElement('a');
      const safeName = (tableName || branchName || 'Menu').replace(/\s+/g, '-');
      link.download = `QR-${safeName}.png`;
      link.href = highResDataUrl;
      link.click();
      showToast('Downloaded High-Res PNG (800x800)', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PNG', 'error');
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel as QRCode.QRCodeErrorCorrectionLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (tableName || branchName || 'Menu').replace(/\s+/g, '-');
      link.download = `QR-${safeName}.svg`;
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl);
      showToast('Downloaded Vector SVG', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download SVG', 'error');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Menu URL copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg flex flex-col items-center space-y-4 max-w-sm w-full mx-auto text-center relative">
      {/* Decorative scanner frame around canvas */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative group shadow-inner">
        {/* Corner markers */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500 rounded-br-sm pointer-events-none" />

        <canvas ref={canvasRef} className="rounded-xl shadow-xs transition-transform group-hover:scale-[1.02]" />
      </div>

      <div className="space-y-1 w-full px-2">
        {branchName && (
          <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> {branchName}
          </p>
        )}
        {tableName && <h4 className="text-base font-black text-slate-900">{tableName}</h4>}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <p className="text-[11px] font-mono text-slate-500 truncate max-w-[200px] bg-slate-100 px-2 py-0.5 rounded-md">
            {url}
          </p>
          <button
            onClick={handleCopyUrl}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full pt-1">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPng}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            PNG (800px)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={FileCode2}
            onClick={handleDownloadSvg}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
          >
            Vector SVG
          </Button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors w-full"
          title="Test Scan / View Menu in New Tab"
        >
          <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
          <span>Test Public Menu View</span>
        </a>

        {onOpenPdfStudio && (
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={onOpenPdfStudio}
            className="w-full text-amber-700 border-amber-300 hover:bg-amber-50 font-bold"
          >
            Print & PDF Table Cards
          </Button>
        )}
      </div>
    </div>
  );
};

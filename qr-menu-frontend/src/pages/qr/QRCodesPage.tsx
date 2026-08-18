import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { qrApi } from '../../api/qr.api';
import { branchApi } from '../../api/branch.api';
import { tableApi } from '../../api/table.api';
import { Branch, Table } from '../../types';
import { QRPreview } from '../../components/qr/QRPreview';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PrintableQRModal } from '../../components/qr/PrintableQRModal';
import { useToast } from '../../hooks/useToast';
import QRCode from 'qrcode';
import {
  Sparkles,
  Sliders,
  Printer,
  FileText,
  Palette,
  QrCode,
  Download,
  ExternalLink,
  Copy,
  Check,
  LayoutGrid,
  Search,
  Wifi,
  Radio,
  FileCode2,
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Habesha Gold', fg: '#d97706', bg: '#ffffff' },
  { name: 'Midnight Slate', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Royal Habesha', fg: '#7c3aed', bg: '#ffffff' },
  { name: 'Emerald Clean', fg: '#059669', bg: '#ffffff' },
  { name: 'Crimson Velvet', fg: '#dc2626', bg: '#ffffff' },
  { name: 'Dark Luxury', fg: '#f59e0b', bg: '#0f172a' },
];

export const QRCodesPage: React.FC = () => {
  const { showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(240);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [customQrUrl, setCustomQrUrl] = useState<string>('');
  const [qrMode, setQrMode] = useState<'AUTO' | 'CUSTOM' | 'WIFI'>('AUTO');
  const [wifiSsid, setWifiSsid] = useState('HabeshaHeritage_Guest');
  const [wifiPass, setWifiPass] = useState('Heritage2026');

  const [qrCodeData, setQrCodeData] = useState<{ url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [tableCanvasMap, setTableCanvasMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([branchApi.getAll(), tableApi.getAll()]).then(([bRes, tRes]) => {
      setBranches(bRes.data);
      setTables(tRes.data);
      if (bRes.data.length > 0) {
        setSelectedBranchId(bRes.data[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  const branchTables = tables.filter((t) => t.branchId === selectedBranchId);

  // Compute active target URL based on mode
  useEffect(() => {
    if (!selectedBranchId) return;
    setIsLoading(true);

    if (qrMode === 'CUSTOM') {
      const url = customQrUrl || `${window.location.origin}/public/branches/${selectedBranchId}/menu`;
      setQrCodeData({ url });
      setIsLoading(false);
    } else if (qrMode === 'WIFI') {
      const wifiString = `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`;
      setQrCodeData({ url: wifiString });
      setIsLoading(false);
    } else {
      qrApi
        .generate({
          branchId: selectedBranchId,
          tableId: selectedTableId || undefined,
          fgColor,
          bgColor,
          size: qrSize,
        })
        .then((res) => {
          setQrCodeData({ url: res.data.targetUrl || res.data.url });
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedBranchId, selectedTableId, fgColor, bgColor, qrSize, qrMode, customQrUrl, wifiSsid, wifiPass]);

  // Generate thumbnail DataURLs for all branch tables in grid
  useEffect(() => {
    if (!selectedBranchId || branchTables.length === 0) return;
    const promises = branchTables.map(async (t) => {
      const url = `${window.location.origin}/public/branches/${selectedBranchId}/tables/${t.id}/menu`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 1,
        color: { dark: fgColor, light: bgColor },
      });
      return { id: t.id, dataUrl, url };
    });

    Promise.all(promises).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => {
        map[r.id] = r.dataUrl;
      });
      setTableCanvasMap(map);
    });
  }, [selectedBranchId, tables, fgColor, bgColor]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeTable = tables.find((t) => t.id === selectedTableId);

  const handleDownloadTablePng = async (table: Table) => {
    try {
      const url = `${window.location.origin}/public/branches/${selectedBranchId}/tables/${table.id}/menu`;
      const highRes = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
      const link = document.createElement('a');
      link.download = `QR-${(activeBranch?.name || 'Branch').replace(/\s+/g, '-')}-Table-${table.tableNumber}.png`;
      link.href = highRes;
      link.click();
      showToast(`Downloaded PNG for Table #${table.tableNumber}`, 'success');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const handleDownloadTableSvg = async (table: Table) => {
    try {
      const url = `${window.location.origin}/public/branches/${selectedBranchId}/tables/${table.id}/menu`;
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `QR-${(activeBranch?.name || 'Branch').replace(/\s+/g, '-')}-Table-${table.tableNumber}.svg`;
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl);
      showToast(`Downloaded Vector SVG for Table #${table.tableNumber}`, 'success');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const filteredBranchTables = branchTables.filter(
    (t) =>
      t.tableNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (t.section && t.section.toLowerCase().includes(tableSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl font-sans">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-extrabold border border-amber-500/20">
            <QrCode className="h-3.5 w-3.5" />
            High-Resolution Vector QR Studio
          </div>
          <h1 className="text-2xl font-black text-slate-900">QR Code Generator & Styling</h1>
          <p className="text-xs text-slate-500">
            Customize brand colors, error correction, and export high-res PNG, vector SVG, or printable PDF table cards
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="primary"
            size="md"
            icon={Printer}
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
          >
            Print & PDF Table Cards Studio
          </Button>
        </motion.div>
      </motion.div>

      {/* Banner highlight for physical table cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-2xl shadow-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold border border-slate-800 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Physical Table Stand & Sticker PDF Generator
          </div>
          <h3 className="text-lg font-black text-white">Need Physical Stand Cards for your Tables?</h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Generate high-resolution vector PDF table cards (A6 Table Tent, 10x10cm Acrylic Stickers, or Batch A4 Sheets for all {branchTables.length} tables in {activeBranch?.name || 'your restaurant'}) complete with custom branding, instructions, and WiFi details.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative z-10">
          <Button
            variant="secondary"
            size="md"
            icon={FileText}
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold shrink-0 shadow-lg shadow-amber-500/20"
          >
            Open Printable PDF Studio
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-md shadow-slate-200/50"
        >
          {/* QR Mode Switcher */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              QR Code Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setQrMode('AUTO')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  qrMode === 'AUTO' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Table / Menu</span>
              </button>
              <button
                type="button"
                onClick={() => setQrMode('CUSTOM')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  qrMode === 'CUSTOM' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Custom Link</span>
              </button>
              <button
                type="button"
                onClick={() => setQrMode('WIFI')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  qrMode === 'WIFI' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wifi className="h-3.5 w-3.5" />
                <span>Wi-Fi QR</span>
              </button>
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {qrMode === 'AUTO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Branch Location *"
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setSelectedTableId('');
                }}
                options={branches.map((b) => ({ label: b.name, value: b.id }))}
              />

              <Select
                label="Assign Table (Optional)"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                options={[
                  { label: '-- Master General Menu QR --', value: '' },
                  ...branchTables.map((t) => ({
                    label: `Table #${t.tableNumber} (${t.capacity || 4} guests)`,
                    value: t.id,
                  })),
                ]}
              />
            </div>
          )}

          {qrMode === 'CUSTOM' && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Custom Target URL or Text
              </label>
              <input
                type="text"
                value={customQrUrl}
                onChange={(e) => setCustomQrUrl(e.target.value)}
                placeholder="https://habeshaheritage.com/special-event"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {qrMode === 'WIFI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Wi-Fi SSID (Network Name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Wi-Fi Password
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Color Palette Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-500" />
              Brand Color Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    fgColor === preset.fg && bgColor === preset.bg
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: preset.fg }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hex Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Foreground Color
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono font-semibold uppercase">{fgColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Background Color
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono font-semibold uppercase">{bgColor}</span>
              </div>
            </div>
          </div>

          {/* Error Correction & Size Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Error Correction Level
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center">
                {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setErrorCorrectionLevel(lvl)}
                    className={`py-1.5 rounded-lg transition-all ${
                      errorCorrectionLevel === lvl
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                {errorCorrectionLevel === 'L' && 'Low (7% recovery, smallest size)'}
                {errorCorrectionLevel === 'M' && 'Medium (15% recovery, recommended)'}
                {errorCorrectionLevel === 'Q' && 'Quartile (25% recovery)'}
                {errorCorrectionLevel === 'H' && 'High (30% recovery, best for logo overlays)'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Preview Dimension
                </label>
                <span className="text-xs font-mono font-bold text-amber-600">{qrSize}px</span>
              </div>
              <input
                type="range"
                min={180}
                max={360}
                step={20}
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Live Vector Preview Column */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-5 flex flex-col items-center justify-center"
        >
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Rendering vector preview...</div>
          ) : qrCodeData ? (
            <QRPreview
              url={qrCodeData.url}
              fgColor={fgColor}
              bgColor={bgColor}
              size={qrSize}
              errorCorrectionLevel={errorCorrectionLevel}
              branchName={activeBranch?.name}
              tableName={
                qrMode === 'WIFI'
                  ? `Guest Wi-Fi (${wifiSsid})`
                  : activeTable
                  ? `Table #${activeTable.tableNumber}`
                  : 'Master General Menu'
              }
              onOpenPdfStudio={() => setIsPrintModalOpen(true)}
            />
          ) : null}
        </motion.div>
      </div>

      {/* Table Cards Grid for Branch Location */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-amber-500" />
              <span>{activeBranch?.name || 'Branch'} Dining Tables ({branchTables.length} Tables)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct table links ready to scan, download as 800px PNGs, vector SVG, or generate printable PDF table cards
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search table #..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white w-40 sm:w-52"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => setIsPrintModalOpen(true)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 font-bold shrink-0"
            >
              Batch PDF Sheet
            </Button>
          </div>
        </div>

        {filteredBranchTables.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No tables matched your search filter for this branch location.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBranchTables.map((table) => {
              const tableUrl = `${window.location.origin}/public/branches/${selectedBranchId}/tables/${table.id}/menu`;
              const dataUrl = tableCanvasMap[table.id];

              return (
                <motion.div
                  key={table.id}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center text-center space-y-3"
                >
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      Table #{table.tableNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {table.capacity || 4} Guests
                    </span>
                  </div>

                  {/* QR Image Thumbnail */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 relative group w-full flex items-center justify-center">
                    {dataUrl ? (
                      <img src={dataUrl} alt={`Table ${table.tableNumber}`} className="w-32 h-32 object-contain" />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </div>

                  <p className="text-[10px] font-mono text-slate-400 truncate w-full px-1">
                    {tableUrl}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                    <Button
                      variant="primary"
                      size="xs"
                      icon={Download}
                      onClick={() => handleDownloadTablePng(table)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                    >
                      PNG
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={FileCode2}
                      onClick={() => handleDownloadTableSvg(table)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[11px]"
                    >
                      SVG
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    <a
                      href={tableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors"
                      title="Test Menu Link"
                    >
                      <ExternalLink className="h-3 w-3 text-amber-600" />
                      <span>Test Scan</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTableId(table.id);
                        setIsPrintModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold transition-colors"
                      title="Print PDF Card"
                    >
                      <Printer className="h-3 w-3 text-amber-700" />
                      <span>PDF Card</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <PrintableQRModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        branches={branches}
        tables={tables}
        defaultBranchId={selectedBranchId}
        defaultTableId={selectedTableId}
      />
    </div>
  );
};

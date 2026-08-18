import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Branch, Table } from '../../types';
import { useToast } from '../../hooks/useToast';
import {
  generateSingleTableCardPdf,
  generateBatchBranchQRPdf,
  QRPdfOptions,
} from '../../utils/qrPdfGenerator';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Wifi,
  Palette,
  LayoutGrid,
  Check,
  Info,
} from 'lucide-react';

interface PrintableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  tables: Table[];
  defaultBranchId?: string;
  defaultTableId?: string;
}

const COLOR_PALETTES = [
  { name: 'Purple Elegance', hex: '#4c1d95', bgLight: 'bg-purple-50 text-purple-900 border-purple-200' },
  { name: 'Emerald Clean', hex: '#047857', bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  { name: 'Ocean Blue', hex: '#1d4ed8', bgLight: 'bg-blue-50 text-blue-900 border-blue-200' },
  { name: 'Sunset Amber', hex: '#b45309', bgLight: 'bg-amber-50 text-amber-900 border-amber-200' },
  { name: 'Dark Luxury', hex: '#0f172a', bgLight: 'bg-slate-900 text-white border-slate-700' },
];

export const PrintableQRModal: React.FC<PrintableQRModalProps> = ({
  isOpen,
  onClose,
  branches,
  tables,
  defaultBranchId,
  defaultTableId,
}) => {
  const { showToast } = useToast();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultBranchId || '');
  const [selectedTableId, setSelectedTableId] = useState<string>(defaultTableId || '');
  const [exportMode, setExportMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');

  const [templateType, setTemplateType] = useState<'TABLE_TENT_A6' | 'STICKER_SQUARE'>(
    'TABLE_TENT_A6'
  );

  const [headline, setHeadline] = useState('SCAN FOR DIGITAL MENU');
  const [subtext, setSubtext] = useState(
    'Point smartphone camera to view menu, daily specials & place order'
  );
  const [wifiInfo, setWifiInfo] = useState('ArtisanBistro_Guest / WiFi2026');
  const [accentColor, setAccentColor] = useState('#4c1d95');

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string>('');

  // Sync state when defaults change
  useEffect(() => {
    if (defaultBranchId) setSelectedBranchId(defaultBranchId);
    if (defaultTableId) setSelectedTableId(defaultTableId);
    else if (!selectedBranchId && branches.length > 0) setSelectedBranchId(branches[0].id);
  }, [defaultBranchId, defaultTableId, branches]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const branchTables = tables.filter((t) => t.branchId === (selectedBranchId || activeBranch?.id));
  const activeTable = tables.find((t) => t.id === selectedTableId) || branchTables[0];

  // Target URL
  const targetUrl = activeTable
    ? `${window.location.origin}/public/branches/${activeBranch?.id || 'branch-1'}/tables/${activeTable.id}/menu`
    : `${window.location.origin}/public/branches/${activeBranch?.id || 'branch-1'}/menu`;

  // Render QR Data URL for preview
  useEffect(() => {
    if (!targetUrl) return;
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: accentColor,
        light: '#ffffff',
      },
    })
      .then((url) => setPreviewQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [targetUrl, accentColor]);

  const handleDownloadPdf = async () => {
    if (!activeBranch) {
      showToast('Please select a branch location', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      if (exportMode === 'BATCH') {
        if (branchTables.length === 0) {
          showToast('No tables configured for this branch location', 'error');
          setIsGenerating(false);
          return;
        }

        const formattedTables = branchTables.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          url: `${window.location.origin}/public/branches/${activeBranch.id}/tables/${t.id}/menu`,
        }));

        const pdfDoc = await generateBatchBranchQRPdf({
          branchName: activeBranch.name,
          tables: formattedTables,
          headline,
          subtext,
          wifiInfo,
          accentColor,
        });

        pdfDoc.save(`Printable-QR-Cards-${activeBranch.name.replace(/\s+/g, '-')}-Batch.pdf`);
        showToast(
          `Exported batch A4 PDF containing ${branchTables.length} table cards!`,
          'success'
        );
      } else {
        const pdfDoc = await generateSingleTableCardPdf({
          branchName: activeBranch.name,
          tableName: activeTable ? `Table #${activeTable.tableNumber}` : 'Master Branch Menu',
          qrUrl: targetUrl,
          headline,
          subtext,
          wifiInfo,
          accentColor,
          templateType,
        });

        const label = activeTable ? `Table-${activeTable.tableNumber}` : 'General-Menu';
        pdfDoc.save(`QR-Menu-Card-${activeBranch.name.replace(/\s+/g, '-')}-${label}.pdf`);
        showToast('Downloaded high-res printable PDF card!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF file', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = async () => {
    if (!activeBranch) return;
    setIsGenerating(true);
    try {
      let pdfDoc;
      if (exportMode === 'BATCH') {
        const formattedTables = branchTables.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          url: `${window.location.origin}/public/branches/${activeBranch.id}/tables/${t.id}/menu`,
        }));

        pdfDoc = await generateBatchBranchQRPdf({
          branchName: activeBranch.name,
          tables: formattedTables,
          headline,
          subtext,
          wifiInfo,
          accentColor,
        });
      } else {
        pdfDoc = await generateSingleTableCardPdf({
          branchName: activeBranch.name,
          tableName: activeTable ? `Table #${activeTable.tableNumber}` : 'Master Branch Menu',
          qrUrl: targetUrl,
          headline,
          subtext,
          wifiInfo,
          accentColor,
          templateType,
        });
      }

      // Open PDF in print window
      const blob = pdfDoc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        showToast('Please allow popups to launch print preview', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to launch print job', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Printable QR Code & Table Stand Studio"
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Export Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setExportMode('SINGLE')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                exportMode === 'SINGLE'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Single Table Card
            </button>
            <button
              type="button"
              onClick={() => setExportMode('BATCH')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                exportMode === 'BATCH'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Batch Branch A4 Sheet ({branchTables.length} Tables)
            </button>
          </div>

          {/* Branch & Table Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Branch Location *"
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedTableId('');
              }}
              options={branches.map((b) => ({ label: b.name, value: b.id }))}
            />

            {exportMode === 'SINGLE' ? (
              <Select
                label="Target Table Card *"
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
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Included Tables
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-purple-700">
                  {branchTables.length} table cards will be formatted into A4 PDF pages
                </div>
              </div>
            )}
          </div>

          {/* Template Format Selector */}
          {exportMode === 'SINGLE' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Physical Stand Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateType('TABLE_TENT_A6')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    templateType === 'TABLE_TENT_A6'
                      ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <FileText className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">A6 Vertical Table Stand</p>
                    <p className="text-[10px] text-slate-500">105 x 148 mm • Fits acrylic tent holders</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('STICKER_SQUARE')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    templateType === 'STICKER_SQUARE'
                      ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Palette className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Square Table Sticker</p>
                    <p className="text-[10px] text-slate-500">100 x 100 mm • Corner & block adhesive</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Color Palette Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Brand Accent Palette
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.hex}
                  type="button"
                  onClick={() => setAccentColor(pal.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    accentColor === pal.hex
                      ? 'border-slate-900 ring-2 ring-slate-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: pal.hex }}
                  />
                  <span>{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Customization Fields */}
          <div className="space-y-3 pt-1">
            <Input
              label="Card Header Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. SCAN FOR DIGITAL MENU"
            />

            <Input
              label="Instructions Subtext"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Point phone camera to view full menu"
            />

            <Input
              label="WiFi Credentials / Guest Slogan (Optional)"
              value={wifiInfo}
              onChange={(e) => setWifiInfo(e.target.value)}
              placeholder="e.g. Bistro_Guest / Pass123"
            />
          </div>
        </div>

        {/* Right Column: High Fidelity Live Preview Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-4">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Live Print Card Render
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {exportMode === 'BATCH'
                ? `A4 Sheet (${branchTables.length} Cards)`
                : templateType === 'TABLE_TENT_A6'
                ? 'A6 Stand (105x148mm)'
                : '10x10cm Sticker'}
            </span>
          </div>

          {/* Live Render Card Visual */}
          <div
            className="w-full max-w-[260px] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border-2 transition-all"
            style={{ borderColor: accentColor }}
          >
            {/* Header Banner */}
            <div className="p-3 text-center text-white space-y-0.5" style={{ backgroundColor: accentColor }}>
              <p className="text-xs font-black uppercase tracking-wider">{activeBranch?.name || 'Artisan Bistro'}</p>
              <p className="text-[9px] font-semibold text-purple-200 opacity-90 uppercase">
                Contactless Table Service
              </p>
            </div>

            <div className="p-4 flex flex-col items-center text-center space-y-2.5">
              {/* Table Identification Pill */}
              <div
                className="px-4 py-1 rounded-full text-xs font-extrabold uppercase border"
                style={{
                  color: accentColor,
                  backgroundColor: '#f5f3ff',
                  borderColor: accentColor,
                }}
              >
                {activeTable ? `TABLE #${activeTable.tableNumber}` : 'General Menu QR'}
              </div>

              <p className="text-[11px] font-bold text-slate-900 leading-tight">{headline}</p>

              {/* QR Image */}
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-xs">
                {previewQrDataUrl ? (
                  <img src={previewQrDataUrl} alt="QR Preview" className="w-32 h-32 object-contain" />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 animate-pulse rounded-lg" />
                )}
              </div>

              <p className="text-[9.5px] text-slate-500 leading-tight px-2">{subtext}</p>

              {/* Instructions Bar */}
              <div
                className="w-full py-1.5 px-2 rounded-lg text-[8.5px] font-black uppercase tracking-tight text-center"
                style={{ backgroundColor: '#f8fafc', color: accentColor }}
              >
                1. OPEN CAMERA → 2. SCAN → 3. ORDER
              </div>

              {wifiInfo && (
                <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-purple-600" />
                  WiFi: {wifiInfo}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={Download}
              onClick={handleDownloadPdf}
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold"
            >
              Download High-Res PDF
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={Printer}
              onClick={handleDirectPrint}
              isLoading={isGenerating}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Print Menu Cards Directly
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

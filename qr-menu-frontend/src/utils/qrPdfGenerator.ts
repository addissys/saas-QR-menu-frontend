import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface QRPdfOptions {
  branchName: string;
  tableName: string;
  qrUrl: string;
  headline?: string;
  subtext?: string;
  wifiInfo?: string;
  accentColor?: string; // hex e.g. #4c1d95
  bgColor?: string; // hex
  templateType?: 'TABLE_TENT_A6' | 'STICKER_SQUARE' | 'TABLE_STAND_A5';
}

export interface BatchQRPdfOptions {
  branchName: string;
  tables: Array<{
    id: string;
    tableNumber: string;
    url: string;
    capacity?: number;
  }>;
  headline?: string;
  subtext?: string;
  wifiInfo?: string;
  accentColor?: string;
  templateType?: 'TABLE_TENT_A6' | 'BATCH_A4_GRID';
}

// Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Generate a high-resolution single table card PDF document (A6 / Table Stand format)
 */
export async function generateSingleTableCardPdf(options: QRPdfOptions): Promise<jsPDF> {
  const {
    branchName,
    tableName,
    qrUrl,
    headline = 'SCAN FOR DIGITAL MENU',
    subtext = 'Point your phone camera to view full food & drinks catalog',
    wifiInfo = '',
    accentColor = '#4c1d95',
    templateType = 'TABLE_TENT_A6',
  } = options;

  const rgb = hexToRgb(accentColor);

  // High quality QR Code image Data URL
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 800,
    margin: 1,
    color: {
      dark: accentColor,
      light: '#ffffff',
    },
  });

  if (templateType === 'STICKER_SQUARE') {
    // 100mm x 100mm Square Sticker
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 100],
    });

    // Outer border frame
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(1);
    doc.roundedRect(4, 4, 92, 92, 4, 4);

    // Header bar
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(6, 6, 88, 14, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(branchName.toUpperCase(), 50, 15, { align: 'center' });

    // Table Badge
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(25, 24, 50, 8, 2, 2, 'F');
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(9);
    doc.text(tableName.toUpperCase(), 50, 29.5, { align: 'center' });

    // QR Code
    doc.addImage(qrDataUrl, 'PNG', 20, 34, 60, 60);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Camera Scan • Touchless Menu', 50, 97, { align: 'center' });

    return doc;
  }

  // Default: A6 Table Tent Stand Card (105mm x 148mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a6', // 105 x 148 mm
  });

  const pageWidth = 105;
  const pageHeight = 148;

  // Background Accent Fill (Top header banner)
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Restaurant / Branch Badge Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(branchName.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(233, 213, 255);
  doc.text('CONTACTLESS TABLE SERVICE', pageWidth / 2, 22, { align: 'center' });

  // White Card Inner Frame
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.roundedRect(8, 28, pageWidth - 16, pageHeight - 36, 5, 5, 'FD');

  // Table Identification Pill
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth / 2 - 28, 32, 56, 10, 3, 3, 'FD');

  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(tableName.toUpperCase(), pageWidth / 2, 38.5, { align: 'center' });

  // Main Headline
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(headline, pageWidth / 2, 48, { align: 'center' });

  // High-Res Embedded QR Code Image
  const qrSize = 58; // mm
  doc.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 51, qrSize, qrSize);

  // Subtext instructions
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const splitSubtext = doc.splitTextToSize(subtext, pageWidth - 28);
  doc.text(splitSubtext, pageWidth / 2, 114, { align: 'center' });

  // Step Icons / Instructions Bar
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 121, pageWidth - 24, 12, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text('1. OPEN CAMERA  →  2. SCAN CODE  →  3. BROWSE MENU', pageWidth / 2, 128.5, {
    align: 'center',
  });

  // Wifi info or Footer Slogan
  if (wifiInfo) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`WiFi: ${wifiInfo}`, pageWidth / 2, 138, { align: 'center' });
  } else {
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Powered by QR DineMenu • Instant Digital Dining', pageWidth / 2, 138, { align: 'center' });
  }

  return doc;
}

/**
 * Generate a multi-table A4 grid PDF (4 cards per page) for easy batch printing & cutting
 */
export async function generateBatchBranchQRPdf(options: BatchQRPdfOptions): Promise<jsPDF> {
  const {
    branchName,
    tables,
    headline = 'SCAN FOR DIGITAL MENU',
    subtext = 'Point smartphone camera to browse menu',
    wifiInfo = '',
    accentColor = '#4c1d95',
  } = options;

  const rgb = hexToRgb(accentColor);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Grid dimensions: 2 columns x 2 rows = 4 cards per A4 sheet
  const cardWidth = 92;
  const cardHeight = 130;
  const startX = 10;
  const startY = 15;
  const gapX = 8;
  const gapY = 8;

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];

    // Check if new page is needed after every 4 cards
    if (i > 0 && i % 4 === 0) {
      doc.addPage();
    }

    const indexOnPage = i % 4;
    const col = indexOnPage % 2;
    const row = Math.floor(indexOnPage / 2);

    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    // Generate high-res QR Data URL for table
    const qrDataUrl = await QRCode.toDataURL(table.url, {
      width: 600,
      margin: 1,
      color: {
        dark: accentColor,
        light: '#ffffff',
      },
    });

    // Outer card border with dotted cut guidelines
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'S');

    // Header Banner
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(x, y, cardWidth, 22, 4, 4, 'F');
    // Square off bottom corners of header
    doc.rect(x, y + 16, cardWidth, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(branchName.toUpperCase(), x + cardWidth / 2, y + 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(233, 213, 255);
    doc.text('CONTACTLESS TABLE MENU', x + cardWidth / 2, y + 16, { align: 'center' });

    // Table Identification Badge
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + cardWidth / 2 - 24, y + 26, 48, 8, 2, 2, 'FD');

    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`TABLE #${table.tableNumber}`, x + cardWidth / 2, y + 31.5, { align: 'center' });

    // Headline
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(headline, x + cardWidth / 2, y + 39, { align: 'center' });

    // QR Image
    const qrImgSize = 52;
    doc.addImage(qrDataUrl, 'PNG', x + (cardWidth - qrImgSize) / 2, y + 41, qrImgSize, qrImgSize);

    // Instructions
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(subtext, x + cardWidth / 2, y + 98, { align: 'center' });

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x + 6, y + 102, cardWidth - 12, 10, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('1. OPEN CAMERA  →  2. SCAN CODE  →  3. BROWSE MENU', x + cardWidth / 2, y + 108, {
      align: 'center',
    });

    if (wifiInfo) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(`WiFi: ${wifiInfo}`, x + cardWidth / 2, y + 118, { align: 'center' });
    } else {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Cut along border to display on table', x + cardWidth / 2, y + 118, { align: 'center' });
    }
  }

  // Page numbering on bottom
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text(`Page ${p} of ${totalPages} • Printable Table QR Sheet for ${branchName}`, pageWidth / 2, pageHeight - 6, {
      align: 'center',
    });
  }

  return doc;
}

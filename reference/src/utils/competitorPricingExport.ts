import * as XLSX from 'xlsx';
import type { CompetitorProduct } from '../mocks/competitorPricing';

interface PriceOverride {
  competitorPrice: number;
  updatedAt: string;
}

interface ExportOptions {
  products: CompetitorProduct[];
  priceOverrides: Record<string, PriceOverride>;
  competitorLabel: string;
  selectedProduct: CompetitorProduct;
  exportDate: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getEffectiveCompetitorPrice(p: CompetitorProduct, overrides: Record<string, PriceOverride>): number {
  return overrides[p.id]?.competitorPrice ?? p.currentCompetitorPrice;
}

function getEffectiveOurPrice(p: CompetitorProduct, overrides: Record<string, PriceOverride>): number {
  return Math.round(getEffectiveCompetitorPrice(p, overrides) * 0.85 * 100) / 100;
}

// ── CSV helpers ──────────────────────────────────────────────────────────────
function escapeCSVField(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCSV(headers: string[], rows: (string | number | boolean)[][]): string {
  const lines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((r) => r.map(escapeCSVField).join(',')),
  ];
  return '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadXLSX(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// ── Sheet builders ──────────────────────────────────────────────────────────

function buildComparisonRows(opts: ExportOptions) {
  const headers = [
    'Product Name',
    'Category',
    'Competitor',
    `${opts.competitorLabel} Price`,
    'Our Price',
    'Savings ($)',
    'Savings (%)',
    'Price Threat',
    'Competitor Product Name',
    'Competitor URL',
    'Price Overridden',
    'Override Date',
    'Last Checked',
  ];
  const rows = opts.products.map((p) => {
    const comp = getEffectiveCompetitorPrice(p, opts.priceOverrides);
    const ours = getEffectiveOurPrice(p, opts.priceOverrides);
    const savings = comp - ours;
    const savePct = comp > 0 ? Math.round((savings / comp) * 100) : 0;
    const isOverridden = !!opts.priceOverrides[p.id];
    return [
      p.name,
      p.category,
      opts.competitorLabel,
      comp,
      ours,
      Math.round(savings * 100) / 100,
      `${savePct}%`,
      savings <= 0 ? 'YES' : 'No',
      p.competitorProductName,
      p.competitorUrl,
      isOverridden ? 'Yes' : 'No',
      isOverridden ? opts.priceOverrides[p.id].updatedAt.slice(0, 10) : '',
      p.lastChecked,
    ];
  });
  return { headers, rows };
}

function buildHistoryRows(opts: ExportOptions) {
  const headers = [
    'Product Name',
    'Category',
    'Month',
    `${opts.competitorLabel} Price`,
    'Our Price',
    'Savings ($)',
    'Savings (%)',
    'Sale Event',
  ];
  const rows: (string | number | boolean)[][] = [];
  opts.products.forEach((p) => {
    p.monthlyHistory.forEach((m) => {
      const savings = m.competitorPrice - m.ourPrice;
      const savePct = m.competitorPrice > 0 ? Math.round((savings / m.competitorPrice) * 100) : 0;
      rows.push([
        p.name,
        p.category,
        m.month,
        m.competitorPrice,
        m.ourPrice,
        Math.round(savings * 100) / 100,
        `${savePct}%`,
        m.hasSale ? (m.saleLabel ?? 'Sale') : '',
      ]);
    });
  });
  return { headers, rows };
}

function buildSizeRows(opts: ExportOptions) {
  const headers = [
    'Product Name',
    'Category',
    'Size',
    'Width',
    'Height',
    `${opts.competitorLabel} Price`,
    'Our Price',
    'Savings ($)',
    'Savings (%)',
  ];
  const rows: (string | number | boolean)[][] = [];
  opts.products.forEach((p) => {
    p.sizes.forEach((s) => {
      const savings = s.competitorPrice - s.ourPrice;
      const savePct = s.competitorPrice > 0 ? Math.round((savings / s.competitorPrice) * 100) : 0;
      rows.push([
        p.name,
        p.category,
        s.label,
        s.width,
        s.height,
        s.competitorPrice,
        s.ourPrice,
        Math.round(savings * 100) / 100,
        `${savePct}%`,
      ]);
    });
  });
  return { headers, rows };
}

// ── Public export functions ─────────────────────────────────────────────────

export function exportComparisonCSV(opts: ExportOptions) {
  const { headers, rows } = buildComparisonRows(opts);
  const csv = rowsToCSV(headers, rows);
  downloadCSV(csv, `competitor-pricing-${opts.competitorLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${opts.exportDate}.csv`);
}

export function exportHistoryCSV(opts: ExportOptions) {
  const { headers, rows } = buildHistoryRows(opts);
  const csv = rowsToCSV(headers, rows);
  downloadCSV(csv, `price-history-${opts.competitorLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${opts.exportDate}.csv`);
}

export function exportSelectedHistoryCSV(opts: ExportOptions) {
  const singleOpts = { ...opts, products: [opts.selectedProduct] };
  const { headers, rows } = buildHistoryRows(singleOpts);
  const csv = rowsToCSV(headers, rows);
  const slug = opts.selectedProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  downloadCSV(csv, `price-history-${slug}-${opts.exportDate}.csv`);
}

export function exportFullExcel(opts: ExportOptions) {
  const wb = XLSX.utils.book_new();

  const addSheet = (name: string, headers: string[], rows: (string | number | boolean)[][]) => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Style header row with bold
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E8F5E9' } } };
      }
    }

    // Auto column widths
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(
        h.length,
        ...rows.map((r) => String(r[i] ?? '').length)
      ) + 2,
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  const comparison = buildComparisonRows(opts);
  addSheet('Price Comparison', comparison.headers, comparison.rows);

  const history = buildHistoryRows(opts);
  addSheet('Monthly History', history.headers, history.rows);

  const sizes = buildSizeRows(opts);
  addSheet('Size Breakdown', sizes.headers, sizes.rows);

  downloadXLSX(
    wb,
    `competitor-pricing-${opts.competitorLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${opts.exportDate}.xlsx`
  );
}

export function exportComparisonExcel(opts: ExportOptions) {
  const wb = XLSX.utils.book_new();
  const { headers, rows } = buildComparisonRows(opts);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2,
  }));
  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, 'Price Comparison');
  downloadXLSX(
    wb,
    `price-comparison-${opts.competitorLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${opts.exportDate}.xlsx`
  );
}

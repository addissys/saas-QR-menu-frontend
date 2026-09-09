import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total number of records (used for "Showing X–Y of Z") */
  totalRecords?: number;
  /** Currently selected rows-per-page value */
  rowsPerPage?: number;
  /** Callback when user changes rows-per-page */
  onRowsPerPageChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  rowsPerPage,
  onRowsPerPageChange,
}) => {
  if (totalPages <= 1 && !onRowsPerPageChange) return null;

  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);

  // Calculate range text
  const showRange = totalRecords !== undefined && rowsPerPage !== undefined;
  const rangeStart = showRange ? (safeCurrentPage - 1) * rowsPerPage! + 1 : 0;
  const rangeEnd = showRange ? Math.min(safeCurrentPage * rowsPerPage!, totalRecords!) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 border-t border-slate-200/80">
      {/* Left: Rows per page selector */}
      <div className="flex items-center gap-3">
        {onRowsPerPageChange && rowsPerPage !== undefined && (
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              Rows per page
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 transition-colors cursor-pointer appearance-none pr-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Record range display */}
        {showRange && totalRecords! > 0 && (
          <p className="text-[11px] text-slate-500 font-medium">
            Showing{' '}
            <span className="text-slate-800 font-bold">{rangeStart}</span>
            –
            <span className="text-slate-800 font-bold">{rangeEnd}</span>
            {' '}of{' '}
            <span className="text-slate-800 font-bold">{totalRecords}</span>
            {' '}records
          </p>
        )}
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mr-1">
          <span>Page</span>
          <select
            value={safeCurrentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            disabled={safeTotalPages <= 1}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 transition-colors cursor-pointer appearance-none pr-5.5 disabled:cursor-not-allowed disabled:bg-slate-100/60 disabled:text-slate-400"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 6px center',
            }}
            aria-label="Select page"
          >
            {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span>of</span>
          <span className="text-slate-800 font-bold">{safeTotalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-150 active:scale-95"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-150 active:scale-95"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

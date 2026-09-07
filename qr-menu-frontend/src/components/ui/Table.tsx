import React, { useState, useEffect, useMemo } from 'react';
import { Pagination } from './Pagination';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  /** Enable built-in pagination (default: true) */
  paginated?: boolean;
  /** Default rows per page (default: 10) */
  defaultPageSize?: number;
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = 'No records found',
  paginated = true,
  defaultPageSize = 10,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  // Reset to page 1 whenever data changes (e.g. after filter / search / refetch)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  // Ensure currentPage stays in bounds
  const safePage = Math.min(currentPage, totalPages);

  const displayedData = useMemo(() => {
    if (!paginated) return data;
    const start = (safePage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, safePage, rowsPerPage, paginated]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (size: number) => {
    setRowsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayedData.map((item, index) => (
                <tr
                  key={item.id || (safePage - 1) * rowsPerPage + index}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3.5 text-xs text-slate-700 align-middle ${
                        col.className || ''
                      }`}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {paginated && data.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={data.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
}

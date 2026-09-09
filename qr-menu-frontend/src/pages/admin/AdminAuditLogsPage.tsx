import React, { useEffect, useState } from 'react';
import { auditLogApi } from '../../api/audit-log.api';
import { AuditLog } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Clock, User } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
  const [method, setMethod] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    setIsLoading(true);
    auditLogApi.getAllGlobal({ page, limit, method: method || undefined, user_role: role || undefined, success: success || undefined, search: search || undefined })
      .then((res) => {
        setLogs(res.data);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setTotalRecords(res.pagination?.total ?? res.data.length);
      })
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, [page, limit, method, role, success, search]);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (l) => (
        <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: (l) => <span className="font-mono text-xs font-bold text-purple-700">{l.method || '-'}</span>,
    },
    {
      header: 'Endpoint',
      accessor: (l) => <span className="font-mono text-[11px] text-slate-700">{l.endpoint || l.entityName || '-'}</span>,
    },
    {
      header: 'Status',
      accessor: (l) => <Badge variant={l.success === false ? 'neutral' : 'success'} size="sm">{l.statusCode || '-'} {l.success === false ? 'FAILED' : 'SUCCESS'}</Badge>,
    },
    {
      header: 'Action',
      accessor: (l) => <span className="font-bold text-slate-900 text-xs uppercase">{l.action}</span>,
    },
    {
      header: 'User Account',
      accessor: (l) => (
        <span className="flex items-center gap-1 text-slate-700 text-xs">
          <User className="h-3.5 w-3.5 text-slate-400" />
          {l.userName || 'System Auto'}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: (l) => <span className="text-xs text-slate-600">{l.userRole || '-'}</span>,
    },
    {
      header: 'Details',
      accessor: (l) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            void auditLogApi.getById(l.id).then(setSelectedLog);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Security Audit Trail</h1>
        <p className="text-xs text-slate-500">Super admin master audit log stream of all platform actions</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Input placeholder="Search endpoint, action, user..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={method} onChange={(event) => { setPage(1); setMethod(event.target.value); }}><option value="">All methods</option><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select>
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }}><option value="">All roles</option><option>SUPER_ADMIN</option><option>CAFE_OWNER</option><option>EXECUTIVE</option><option>BRANCH_MANAGER</option><option>STAFF</option></select>
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={success} onChange={(event) => { setPage(1); setSuccess(event.target.value); }}><option value="">All results</option><option value="true">Success</option><option value="false">Failed</option></select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading master audit logs...</div>
        ) : (
          <div onClick={(event) => { const row = (event.target as HTMLElement).closest('tr'); const index = row ? Array.from(row.parentElement?.children ?? []).indexOf(row) : -1; if (index >= 0 && logs[index]) void auditLogApi.getById(logs[index].id).then(setSelectedLog); }}>
            <Table columns={columns} data={logs} emptyMessage="No master audit records" paginated={false} />
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalRecords={totalRecords}
          rowsPerPage={limit}
          onRowsPerPageChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
        />
      </div>
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Request Details" maxWidth="xl">{selectedLog && <div className="space-y-4 text-xs"><div className="grid gap-3 sm:grid-cols-3"><div><b>Method</b><p>{selectedLog.method || '-'}</p></div><div><b>Status</b><p>{selectedLog.statusCode || '-'}</p></div><div><b>Result</b><p>{selectedLog.success === false ? 'FAILED' : 'SUCCESS'}</p></div></div><div><b>Endpoint</b><pre className="mt-1 overflow-auto rounded-xl bg-slate-50 p-3 font-mono text-[11px] whitespace-pre-wrap">{selectedLog.endpoint || '-'}</pre></div><div className="grid gap-4 sm:grid-cols-2"><div><b>Request Body</b><pre className="mt-1 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(selectedLog.requestBody ?? {}, null, 2)}</pre></div><div><b>Response Body</b><pre className="mt-1 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(selectedLog.responseBody ?? {}, null, 2)}</pre></div></div><p><b>Error:</b> {selectedLog.errorMessage || 'None'}</p></div>}</Modal>
    </div>
  );
};

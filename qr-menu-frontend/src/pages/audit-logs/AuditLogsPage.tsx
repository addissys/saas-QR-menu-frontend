import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { auditLogApi } from '../../api/audit-log.api';
import { AuditLog } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Table as TableUI } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FileSpreadsheet, Search, Clock, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [method, setMethod] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    auditLogApi
      .getAll()
      .then((res) => setLogs(res.data))
      .catch((error: AxiosError<{ message?: string }>) => {
        const message = error.response?.data?.message || error.message || 'Failed to load audit logs';
        showToast(message, 'error');
      })
      .finally(() => setIsLoading(false));
  }, [showToast]);

  const filteredLogs = logs.filter(
    (log) =>
      (!method || log.method === method) &&
      (!role || (role === 'CAFE_OWNER'
        ? ['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER'].includes(log.userRole || '')
        : log.userRole === role)) &&
      (!success || String(log.success !== false) === success) &&
      (!searchQuery || [log.action, log.entityName, log.userEmail, log.endpoint]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Tenant Security Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Audit records for your tenant and assigned branches only
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <Input
          placeholder="Search endpoint, action, user..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="">All methods</option>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">All roles</option>
          <option>CAFE_OWNER</option>
          <option>EXECUTIVE</option>
          <option>BRANCH_MANAGER</option>
          <option>STAFF</option>
        </select>
        <select className="rounded-xl border border-slate-200 px-3 text-xs" value={success} onChange={(event) => setSuccess(event.target.value)}>
          <option value="">All results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No Activity Logs"
            description="There are no audit logs matching your search parameters."
          />
        ) : (
          <TableUI
            columns={[
              {
                header: 'Timestamp',
                accessor: (log: AuditLog) => (
                  <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Method',
                accessor: (log: AuditLog) => (
                  <span className="font-mono text-xs font-bold text-purple-700">{log.method || '-'}</span>
                ),
              },
              {
                header: 'Endpoint',
                accessor: (log: AuditLog) => (
                  <span className="font-mono text-[11px] text-slate-700">{log.endpoint || log.entityName || '-'}</span>
                ),
              },
              {
                header: 'Status',
                accessor: (log: AuditLog) => (
                  <Badge variant={log.success === false ? 'neutral' : 'success'} size="sm">
                    {log.statusCode || '-'} {log.success === false ? 'FAILED' : 'SUCCESS'}
                  </Badge>
                ),
              },
              {
                header: 'Action',
                accessor: (log: AuditLog) => (
                  <Badge
                    variant={
                      log.action.includes('DELETE')
                        ? 'danger'
                        : log.action.includes('CREATE')
                        ? 'success'
                        : 'purple'
                    }
                    size="sm"
                  >
                    {log.action}
                  </Badge>
                ),
              },
              {
                header: 'User Account',
                accessor: (log: AuditLog) => (
                  <span className="flex items-center gap-1 text-xs text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {log.userName || log.userEmail || 'System Auto'}
                  </span>
                ),
              },
              {
                header: 'Role',
                accessor: (log: AuditLog) => (
                  <span className="text-xs text-slate-600">{log.userRole || '-'}</span>
                ),
              },
              {
                header: 'Details',
                accessor: (log: AuditLog) => (
                  <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                    View
                  </Button>
                ),
              },
            ]}
            data={filteredLogs}
          />
        )}
      </div>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Request Details" maxWidth="xl">
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><b>Method</b><p>{selectedLog.method || '-'}</p></div>
              <div><b>Status</b><p>{selectedLog.statusCode || '-'}</p></div>
              <div><b>Result</b><p>{selectedLog.success === false ? 'FAILED' : 'SUCCESS'}</p></div>
            </div>
            <div><b>Endpoint</b><pre className="mt-1 overflow-auto rounded-xl bg-slate-50 p-3">{selectedLog.endpoint || '-'}</pre></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><b>Request Body</b><pre className="mt-1 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3">{JSON.stringify(selectedLog.requestBody ?? {}, null, 2)}</pre></div>
              <div><b>Response Body</b><pre className="mt-1 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3">{JSON.stringify(selectedLog.responseBody ?? {}, null, 2)}</pre></div>
            </div>
            <p><b>Error:</b> {selectedLog.errorMessage || 'None'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

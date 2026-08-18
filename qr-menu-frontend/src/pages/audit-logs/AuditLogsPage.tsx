import React, { useEffect, useState } from 'react';
import { auditLogApi } from '../../api/audit-log.api';
import { AuditLog } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Table as TableUI } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileSpreadsheet, Search, Clock, UserCheck, Shield } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    auditLogApi
      .getAll()
      .then((res) => setLogs(res.data))
      .catch(() => showToast('Failed to load audit logs', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Activity Logs</h1>
        <p className="text-xs text-slate-500">
          Track security, menu updates, user management, and configuration changes across your tenant account
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Filter logs by action, user email, or entity..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                header: 'User',
                accessor: (log: AuditLog) => (
                  <div>
                    <p className="text-xs font-bold text-slate-900">{log.userEmail || 'System'}</p>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {log.userId}</span>
                  </div>
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
                header: 'Target Entity',
                accessor: (log: AuditLog) => (
                  <span className="text-xs font-semibold text-slate-800">
                    {log.entityName}
                  </span>
                ),
              },
              {
                header: 'IP Address',
                accessor: (log: AuditLog) => (
                  <span className="text-xs font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</span>
                ),
              },
            ]}
            data={filteredLogs}
          />
        )}
      </div>
    </div>
  );
};

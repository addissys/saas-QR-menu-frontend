import React, { useEffect, useState } from 'react';
import { auditLogApi } from '../../api/audit-log.api';
import { AuditLog } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { FileSpreadsheet, User, Clock } from 'lucide-react';

export const AuditLogsListPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    auditLogApi
      .getAll()
      .then((res) => setLogs(res.data))
      .finally(() => setIsLoading(false));
  }, []);

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
      header: 'Action / Event',
      accessor: (l) => (
        <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">{l.action}</span>
      ),
    },
    {
      header: 'User Account',
      accessor: (l) => (
        <span className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
          <User className="h-3.5 w-3.5 text-slate-400" />
          {l.userName || 'System Auto'}
        </span>
      ),
    },
    {
      header: 'Event Description',
      accessor: (l) => <span className="text-xs text-slate-600">{l.details}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Audit Trail</h1>
        <p className="text-xs text-slate-500">Security audit logs and record of administrative modifications</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit history...</div>
        ) : (
          <Table columns={columns} data={logs} emptyMessage="No audit logs recorded" />
        )}
      </div>
    </div>
  );
};

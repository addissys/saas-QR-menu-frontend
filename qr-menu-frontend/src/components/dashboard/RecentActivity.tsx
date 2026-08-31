import React from 'react';
import { AuditLogItem } from '../../types';
import { Activity, Clock } from 'lucide-react';

export const RecentActivity: React.FC<{ logs: AuditLogItem[] }> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">No recent activity recorded</div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {logs.slice(0, 5).map((log) => (
        <div key={log.id} className="py-3 px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                <span className="font-semibold text-purple-700">{log.userName || 'System'}</span>{' '}
                {log.action.toLowerCase()}d a {log.entity ?? log.entityName ?? 'record'}
              </p>
              <p className="text-xs text-slate-500">{log.module ?? 'Activity'} module</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-slate-400 gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

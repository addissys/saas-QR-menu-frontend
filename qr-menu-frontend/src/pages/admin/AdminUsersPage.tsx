import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/auth.api';
import { User } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { User as UserIcon, Mail, ShieldCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .getAllUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<User>[] = [
    {
      header: 'User Full Name',
      accessor: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
            {u.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{u.fullName}</p>
            <p className="text-[10px] text-slate-400">ID: {u.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: (u) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          {u.email}
        </span>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: (u) => (
        <Badge
          variant={u.role === 'SUPER_ADMIN' ? 'purple' : u.role === 'OWNER' ? 'success' : 'neutral'}
          size="sm"
        >
          {u.role}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Users Directory</h1>
        <p className="text-xs text-slate-500">Cross-tenant list of all user accounts and platform roles</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading platform users...</div>
        ) : (
          <Table columns={columns} data={users} emptyMessage="No users found" />
        )}
      </div>
    </div>
  );
};

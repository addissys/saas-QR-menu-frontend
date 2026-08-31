import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { User } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Mail, Search, ShieldCheck, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUsers()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list);
      })
      .catch((err) => {
        console.error('Failed to load global users:', err);
        setUsers([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof u.role === 'string' && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleBadgeVariant = (roleStr: string) => {
    switch (roleStr) {
      case 'SUPER_ADMIN':
        return 'purple';
      case 'CAFE_OWNER':
      case 'RESTAURANT_OWNER':
      case 'OWNER':
        return 'success';
      case 'EXECUTIVE':
      case 'BRANCH_MANAGER':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'User Full Name',
      accessor: (u) => {
        const displayName = u.fullName || u.email || 'User';
        const initial = displayName.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
              {initial}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: {u.id}</p>
            </div>
          </div>
        );
      },
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
      accessor: (u) => {
        const roleName = typeof u.role === 'object' ? (u.role as any)?.name : u.role || 'STAFF';
        return (
          <Badge variant={getRoleBadgeVariant(roleName)} size="sm">
            {roleName}
          </Badge>
        );
      },
    },
    {
      header: 'Account Status',
      accessor: (u) => (
        <Badge variant={u.isActive !== false ? 'success' : 'neutral'} size="sm">
          {u.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Global Users Directory</h1>
        <p className="text-xs text-slate-500">Cross-tenant list of all user accounts and platform permissions</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search users by name, email, or role..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading platform users...</div>
        ) : (
          <Table columns={columns} data={filteredUsers} emptyMessage="No users found" />
        )}
      </div>
    </div>
  );
};

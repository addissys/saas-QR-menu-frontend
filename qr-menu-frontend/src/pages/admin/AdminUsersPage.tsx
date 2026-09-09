import React, { useEffect, useState, useMemo } from 'react';
import { adminApi } from '../../api/admin.api';
import { branchApi } from '../../api/branch.api';
import { User, Tenant, Branch } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Mail, Search, Building2, MapPin, X } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getUsers(),
      adminApi.getTenants(),
      branchApi.getAllGlobal(),
    ])
      .then(([userRes, tenantList, branchRes]) => {
        setUsers(Array.isArray(userRes.data) ? userRes.data : []);
        setTenants(Array.isArray(tenantList) ? tenantList : []);
        setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      })
      .catch((err) => {
        console.error('Failed to load global users:', err);
        setUsers([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Cascading branch options: filtered by selected tenant
  const filteredBranchOptions = useMemo(() => {
    if (!selectedTenantId) return branches;
    return branches.filter((b) => b.tenantId === selectedTenantId);
  }, [branches, selectedTenantId]);

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roleSet = new Set<string>();
    users.forEach((u) => {
      if (u.role) roleSet.add(typeof u.role === 'string' ? u.role : '');
    });
    return Array.from(roleSet).filter(Boolean).sort();
  }, [users]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId && selectedBranchId) {
      const branchStillValid = branches.some(
        (b) => b.id === selectedBranchId && b.tenantId === tenantId
      );
      if (!branchStillValid) setSelectedBranchId('');
    }
  };

  const clearFilters = () => {
    setSelectedTenantId('');
    setSelectedBranchId('');
    setSelectedRole('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTenantId || selectedBranchId || selectedRole || searchQuery;

  // Build lookup maps
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t.businessName])), [tenants]);
  const branchMap = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const branchTenantMap = useMemo(() => new Map(branches.map((b) => [b.id, b.tenantId])), [branches]);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((u) => {
    // Resolve tenant
    const userTenantId = u.tenantId || (u.branchId ? branchTenantMap.get(u.branchId) : '');

    // Tenant filter
    if (selectedTenantId && userTenantId !== selectedTenantId) return false;

    // Branch filter
    if (selectedBranchId) {
      const matchesBranch = u.branchId === selectedBranchId ||
        u.assignedBranchIds?.includes(selectedBranchId);
      if (!matchesBranch) return false;
    }

    // Role filter
    if (selectedRole) {
      const roleName = typeof u.role === 'object' ? (u.role as any)?.name : u.role;
      if (roleName !== selectedRole) return false;
    }

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tenantName = (u.tenantName || tenantMap.get(userTenantId || '') || '').toLowerCase();
      const branchName = (u.branchName || branchMap.get(u.branchId || '') || '').toLowerCase();
      const roleName = (typeof u.role === 'object' ? (u.role as any)?.name : u.role || '').toLowerCase();
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        roleName.includes(q) ||
        tenantName.includes(q) ||
        branchName.includes(q)
      );
    }

    return true;
  });

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
      header: 'Restaurant',
      accessor: (u) => {
        const userTenantId = u.tenantId || (u.branchId ? branchTenantMap.get(u.branchId) : '');
        const name = u.tenantName || tenantMap.get(userTenantId || '') || '—';
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span className="font-semibold truncate max-w-[120px]">{name}</span>
          </span>
        );
      },
    },
    {
      header: 'Branch',
      accessor: (u) => {
        const assignedCount = u.assignedBranchIds?.length ?? 0;
        if (assignedCount > 1) {
          return (
            <Badge variant="amber" size="sm">
              <MapPin className="h-3 w-3 mr-1 inline" />
              Multi-Branch ({assignedCount})
            </Badge>
          );
        }
        const name = u.branchName || branchMap.get(u.branchId || '') || '—';
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[120px]">{name}</span>
          </span>
        );
      },
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

  const selectedTenantName = tenants.find((t) => t.id === selectedTenantId)?.businessName;
  const selectedBranchName = branches.find((b) => b.id === selectedBranchId)?.name;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Global Users Directory</h1>
        <p className="text-xs text-slate-500">Cross-tenant list of all user accounts and platform permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <Select
              label="Restaurant / Tenant"
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              options={[
                { value: '', label: 'All Restaurants' },
                ...tenants.map((t) => ({ value: t.id, label: t.businessName })),
              ]}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Branch Location"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={[
                { value: '', label: 'All Branches' },
                ...filteredBranchOptions.map((b) => ({ value: b.id, label: b.name })),
              ]}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              label="Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                ...uniqueRoles.map((r) => ({ value: r, label: r.replace(/_/g, ' ') })),
              ]}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by name, email, restaurant, or branch..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Filters:</span>
            {selectedTenantName && (
              <Badge variant="purple" size="sm">
                <Building2 className="h-3 w-3 mr-1 inline" />
                {selectedTenantName}
              </Badge>
            )}
            {selectedBranchName && (
              <Badge variant="success" size="sm">
                <MapPin className="h-3 w-3 mr-1 inline" />
                {selectedBranchName}
              </Badge>
            )}
            {selectedRole && (
              <Badge variant="warning" size="sm">
                {selectedRole.replace(/_/g, ' ')}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="neutral" size="sm">
                <Search className="h-3 w-3 mr-1 inline" />
                "{searchQuery}"
              </Badge>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of{' '}
          <span className="font-bold text-slate-900">{safeUsers.length}</span> users
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading platform users...</div>
        ) : (
          <Table columns={columns} data={filteredUsers} emptyMessage="No users match the selected filters" />
        )}
      </div>
    </div>
  );
};

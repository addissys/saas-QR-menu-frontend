import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { branchApi } from '../../api/branch.api';
import { adminApi } from '../../api/admin.api';
import { Branch, Tenant } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import {
  GitBranch,
  MapPin,
  Phone,
  Search,
  Building2,
  X,
  ExternalLink,
  Store,
  Filter,
} from 'lucide-react';

export const AdminBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTenantId, setSelectedTenantId] = useState<string>(() => searchParams.get('tenantId') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if URL search param changes
  useEffect(() => {
    const urlTenantId = searchParams.get('tenantId') || '';
    if (urlTenantId !== selectedTenantId) {
      setSelectedTenantId(urlTenantId);
    }
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      branchApi.getAllGlobal(),
      adminApi.getTenants(),
    ])
      .then(([branchRes, tenantList]) => {
        const list = Array.isArray(branchRes.data) ? branchRes.data : [];
        setBranches(list);
        setTenants(Array.isArray(tenantList) ? tenantList : []);
      })
      .catch((err) => {
        console.error('Failed to load global branches or tenants:', err);
        setBranches([]);
        setTenants([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fast lookup of tenant business names by ID
  const tenantMap = useMemo(
    () => new Map(tenants.map((t) => [t.id, t.businessName])),
    [tenants]
  );

  // Sorted list of tenants for dropdown
  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) =>
      (a.businessName || '').localeCompare(b.businessName || '')
    );
  }, [tenants]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tenantId) {
        next.set('tenantId', tenantId);
      } else {
        next.delete('tenantId');
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedTenantId('');
    setStatusFilter('all');
    setSearchQuery('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('tenantId');
      return next;
    });
  };

  const hasActiveFilters = Boolean(selectedTenantId || statusFilter !== 'all' || searchQuery);

  const selectedTenantName = tenants.find((t) => t.id === selectedTenantId)?.businessName;

  const safeBranches = Array.isArray(branches) ? branches : [];

  // Filter branches according to tenant, status, and search query
  const filteredBranches = useMemo(() => {
    return safeBranches.filter((b) => {
      // 1. Tenant Filter
      if (selectedTenantId && b.tenantId !== selectedTenantId) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter === 'active' && b.isActive === false) {
        return false;
      }
      if (statusFilter === 'inactive' && b.isActive !== false) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tenantName = (b.tenantName || tenantMap.get(b.tenantId) || '').toLowerCase();
        return (
          b.name?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.phone?.toLowerCase().includes(q) ||
          b.tenantId?.toLowerCase().includes(q) ||
          tenantName.includes(q)
        );
      }

      return true;
    });
  }, [safeBranches, selectedTenantId, statusFilter, searchQuery, tenantMap]);

  // Statistics counters
  const totalBranchesCount = safeBranches.length;
  const activeBranchesCount = safeBranches.filter((b) => b.isActive !== false).length;
  const filteredCount = filteredBranches.length;

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Name',
      accessor: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{b.name}</p>
            {b.city ? (
              <span className="text-[10px] text-slate-400 font-medium">{b.city}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">ID: {b.id.slice(0, 8)}...</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Restaurant / Tenant',
      accessor: (b) => {
        const tenantName = b.tenantName || tenantMap.get(b.tenantId) || 'Tenant';
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <Link
                to={`/admin/restaurants/${b.tenantId}`}
                className="font-semibold text-xs text-slate-900 hover:text-purple-600 hover:underline transition-colors inline-flex items-center gap-1 group"
                title="View Restaurant Details"
              >
                <span className="truncate max-w-[150px]">{tenantName}</span>
                <ExternalLink className="h-2.5 w-2.5 text-slate-400 group-hover:text-purple-600 inline shrink-0" />
              </Link>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {b.tenantId}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Location & Address',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[200px]">
            {b.address || 'No address provided'}
            {b.city ? `, ${b.city}` : ''}
          </span>
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {b.phone || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (b) => (
        <Badge variant={b.isActive !== false ? 'success' : 'neutral'} size="sm">
          {b.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Global Branches Catalog</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Cross-tenant catalog of every branch location created across all registered restaurants
          </p>
        </div>

        {/* Metric pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-slate-400 font-medium">Total Branches: </span>
            <span className="font-bold text-slate-800">{totalBranchesCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-slate-400 font-medium">Active: </span>
            <span className="font-bold text-emerald-600">{activeBranchesCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-slate-400 font-medium">Tenants: </span>
            <span className="font-bold text-purple-600">{tenants.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tenant Filter Dropdown */}
          <div className="w-full sm:w-64">
            <Select
              label="Filter by Restaurant / Tenant"
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              options={[
                { value: '', label: `All Restaurants (${tenants.length})` },
                ...sortedTenants.map((t) => ({
                  value: t.id,
                  label: t.businessName || `Tenant (${t.id.slice(0, 8)})`,
                })),
              ]}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-44">
            <Select
              label="Branch Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
            />
          </div>

          {/* Text Search Input */}
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search branches by name, city, address, phone, or tenant..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Active Filters:
            </span>

            {selectedTenantName && (
              <Badge variant="purple" size="sm" className="flex items-center gap-1">
                <Store className="h-3 w-3" />
                <span>{selectedTenantName}</span>
                <button
                  type="button"
                  onClick={() => handleTenantChange('')}
                  className="hover:text-purple-900 ml-1 cursor-pointer"
                  title="Remove tenant filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {statusFilter !== 'all' && (
              <Badge
                variant={statusFilter === 'active' ? 'success' : 'neutral'}
                size="sm"
                className="flex items-center gap-1"
              >
                <span>{statusFilter === 'active' ? 'Active Branches' : 'Inactive Branches'}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="hover:opacity-80 ml-1 cursor-pointer"
                  title="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {searchQuery && (
              <Badge variant="neutral" size="sm" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-80 ml-1 cursor-pointer"
                  title="Clear search query"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
            >
              <X className="h-3 w-3" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <p>
          Showing <span className="font-bold text-slate-900">{filteredCount}</span> of{' '}
          <span className="font-bold text-slate-900">{totalBranchesCount}</span> global branch
          {totalBranchesCount === 1 ? '' : 'es'}
          {selectedTenantName ? ` for "${selectedTenantName}"` : ''}
        </p>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p>Loading global branches and tenant catalog...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredBranches}
            emptyMessage={
              hasActiveFilters
                ? 'No global branches match your selected filters.'
                : 'No global branches found across any tenant organization.'
            }
          />
        )}
      </div>
    </div>
  );
};

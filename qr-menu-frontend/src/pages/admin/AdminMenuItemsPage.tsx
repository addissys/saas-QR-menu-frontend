import React, { useEffect, useState, useMemo } from 'react';
import { menuItemApi } from '../../api/menu-item.api';
import { adminApi } from '../../api/admin.api';
import { branchApi } from '../../api/branch.api';
import { MenuItem, Tenant, Branch } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Star, Search, Building2, MapPin, X } from 'lucide-react';

export const AdminMenuItemsPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      menuItemApi.getAllGlobal(),
      adminApi.getTenants(),
      branchApi.getAllGlobal(),
    ])
      .then(([menuRes, tenantList, branchRes]) => {
        setItems(Array.isArray(menuRes.data) ? menuRes.data : []);
        setTenants(Array.isArray(tenantList) ? tenantList : []);
        setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      })
      .catch((err) => {
        console.error('Failed to load admin menu data:', err);
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Cascading branch options: filtered by selected tenant
  const filteredBranchOptions = useMemo(() => {
    if (!selectedTenantId) return branches;
    return branches.filter((b) => b.tenantId === selectedTenantId);
  }, [branches, selectedTenantId]);

  // When tenant changes, reset branch if it no longer belongs to new tenant
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
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTenantId || selectedBranchId || searchQuery;

  // Build a lookup map for enriching items with tenant/branch names
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t.businessName])), [tenants]);
  const branchMap = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const branchTenantMap = useMemo(() => new Map(branches.map((b) => [b.id, b.tenantId])), [branches]);

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter((item) => {
    // Resolve tenant for this item
    const itemTenantId = item.tenantId || (item.branchId ? branchTenantMap.get(item.branchId) : '');

    // Tenant filter
    if (selectedTenantId && itemTenantId !== selectedTenantId) return false;

    // Branch filter
    if (selectedBranchId && item.branchId !== selectedBranchId) return false;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tenantName = (item.tenantName || tenantMap.get(itemTenantId || '') || '').toLowerCase();
      const branchName = (item.branchName || branchMap.get(item.branchId || '') || '').toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        tenantName.includes(q) ||
        branchName.includes(q)
      );
    }

    return true;
  });

  const columns: Column<MenuItem>[] = [
    {
      header: 'Dish Name',
      accessor: (i) => (
        <div className="flex items-center gap-2.5">
          <img
            src={i.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
            alt={i.name}
            className="w-10 h-10 rounded-xl object-cover bg-slate-100"
          />
          <div>
            <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
              {i.name}
              {i.isFeatured && (
                <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
              )}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{i.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Restaurant',
      accessor: (i) => {
        const itemTenantId = i.tenantId || (i.branchId ? branchTenantMap.get(i.branchId) : '');
        const name = i.tenantName || tenantMap.get(itemTenantId || '') || '—';
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span className="font-semibold truncate max-w-[140px]">{name}</span>
          </span>
        );
      },
    },
    {
      header: 'Branch',
      accessor: (i) => {
        const name = i.branchName || branchMap.get(i.branchId || '') || '—';
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[140px]">{name}</span>
          </span>
        );
      },
    },
    {
      header: 'Category',
      accessor: (i) => <span className="text-xs text-purple-600 font-bold">{i.categoryName || 'General'}</span>,
    },
    {
      header: 'Price',
      accessor: (i) => (
        <span className="font-bold text-slate-900 text-xs">
          ${typeof i.price === 'number' ? i.price.toFixed(2) : i.price}
        </span>
      ),
    },
    {
      header: 'Stock Status',
      accessor: (i) => (
        <Badge variant={i.isAvailable !== false ? 'success' : 'danger'} size="sm">
          {i.isAvailable !== false ? 'In Stock' : 'Sold Out'}
        </Badge>
      ),
    },
  ];

  const selectedTenantName = tenants.find((t) => t.id === selectedTenantId)?.businessName;
  const selectedBranchName = branches.find((b) => b.id === selectedBranchId)?.name;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Global Menu Dishes Catalog</h1>
        <p className="text-xs text-slate-500">Cross-tenant catalog of every dish created across the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-56">
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
          <div className="w-full sm:w-56">
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
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search dishes by name, category, restaurant, or branch..."
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
          Showing <span className="font-bold text-slate-900">{filteredItems.length}</span> of{' '}
          <span className="font-bold text-slate-900">{safeItems.length}</span> dishes
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading dishes catalog...</div>
        ) : (
          <Table columns={columns} data={filteredItems} emptyMessage="No menu items match the selected filters" />
        )}
      </div>
    </div>
  );
};

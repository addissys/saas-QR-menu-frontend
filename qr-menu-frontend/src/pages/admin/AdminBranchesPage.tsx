import React, { useEffect, useState } from 'react';
import { branchApi } from '../../api/branch.api';
import { Branch } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { GitBranch, MapPin, Phone, Search } from 'lucide-react';

export const AdminBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    branchApi
      .getAllGlobal()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBranches(list);
      })
      .catch((err) => {
        console.error('Failed to load branches:', err);
        setBranches([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const safeBranches = Array.isArray(branches) ? branches : [];
  const filteredBranches = safeBranches.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tenantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Name',
      accessor: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{b.name}</p>
            {b.tenantName && (
              <p className="text-[10px] text-purple-600 font-semibold">{b.tenantName}</p>
            )}
            <p className="text-[10px] text-slate-400 font-mono">Tenant ID: {b.tenantId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Address',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {b.address}{b.city ? `, ${b.city}` : ''}
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Global Branches Catalog</h1>
        <p className="text-xs text-slate-500">Every branch location created across all tenant organizations</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search branches by name, location, or tenant..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading branches...</div>
        ) : (
          <Table columns={columns} data={filteredBranches} emptyMessage="No global branches found" />
        )}
      </div>
    </div>
  );
};

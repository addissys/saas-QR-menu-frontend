import React, { useEffect, useState } from 'react';
import { branchApi } from '../../api/branch.api';
import { Branch } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { GitBranch, MapPin, Phone } from 'lucide-react';

export const AdminBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    branchApi
      .getAllGlobal()
      .then((res) => setBranches(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Name',
      accessor: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{b.name}</p>
            <p className="text-[10px] text-slate-400">Tenant ID: {b.tenantId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Address',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {b.address}
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          {b.phone}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Branches Catalog</h1>
        <p className="text-xs text-slate-500">Every branch location created across all tenant organizations</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading branches...</div>
        ) : (
          <Table columns={columns} data={branches} emptyMessage="No global branches found" />
        )}
      </div>
    </div>
  );
};

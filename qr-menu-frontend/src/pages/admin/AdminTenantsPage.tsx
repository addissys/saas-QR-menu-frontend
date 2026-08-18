import React, { useEffect, useState } from 'react';
import { tenantApi } from '../../api/tenant.api';
import { Tenant } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Store, Globe, Calendar } from 'lucide-react';

export const AdminTenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tenantApi
      .getAll()
      .then((res) => setTenants(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<Tenant>[] = [
    {
      header: 'Business Name',
      accessor: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{t.businessName}</p>
            <p className="text-[10px] text-slate-400">Tenant ID: {t.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Currency',
      accessor: (t) => <span className="font-bold text-slate-700">{t.currencySymbol || '$'}</span>,
    },
    {
      header: 'Onboarded Date',
      accessor: (t) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="success" size="sm">Active SaaS</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenants Directory</h1>
        <p className="text-xs text-slate-500">Global list of all onboarded restaurant organizations</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading tenants directory...</div>
        ) : (
          <Table columns={columns} data={tenants} emptyMessage="No restaurant tenants registered" />
        )}
      </div>
    </div>
  );
};

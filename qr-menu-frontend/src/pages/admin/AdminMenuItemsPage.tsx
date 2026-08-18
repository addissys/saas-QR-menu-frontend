import React, { useEffect, useState } from 'react';
import { menuItemApi } from '../../api/menu-item.api';
import { MenuItem } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { UtensilsCrossed, Star } from 'lucide-react';

export const AdminMenuItemsPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    menuItemApi
      .getAllGlobal()
      .then((res) => setItems(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<MenuItem>[] = [
    {
      header: 'Dish Name',
      accessor: (i) => (
        <div className="flex items-center gap-2.5">
          <img
            src={i.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
            alt={i.name}
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <p className="font-bold text-slate-900">{i.name}</p>
            <p className="text-[10px] text-slate-400">Tenant ID: {i.tenantId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (i) => <span className="text-xs text-purple-600 font-bold">{i.categoryName || 'General'}</span>,
    },
    {
      header: 'Price',
      accessor: (i) => <span className="font-bold text-slate-900">${i.price.toFixed(2)}</span>,
    },
    {
      header: 'Availability',
      accessor: (i) => (
        <Badge variant={i.isAvailable ? 'success' : 'danger'} size="sm">
          {i.isAvailable ? 'In Stock' : 'Sold Out'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Menu Dishes Catalog</h1>
        <p className="text-xs text-slate-500">Cross-tenant catalog of every dish created across the platform</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading dishes catalog...</div>
        ) : (
          <Table columns={columns} data={items} emptyMessage="No menu items cataloged" />
        )}
      </div>
    </div>
  );
};

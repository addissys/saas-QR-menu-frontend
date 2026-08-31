import React, { useEffect, useState } from 'react';
import { menuItemApi } from '../../api/menu-item.api';
import { MenuItem } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { UtensilsCrossed, Star, Search } from 'lucide-react';

export const AdminMenuItemsPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    menuItemApi
      .getAllGlobal()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setItems(list);
      })
      .catch((err) => {
        console.error('Failed to load menu items:', err);
        setItems([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter(
    (i) =>
      i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Global Menu Dishes Catalog</h1>
        <p className="text-xs text-slate-500">Cross-tenant catalog of every dish created across the platform</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search dishes by name, ingredients, or category..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading dishes catalog...</div>
        ) : (
          <Table columns={columns} data={filteredItems} emptyMessage="No menu items cataloged" />
        )}
      </div>
    </div>
  );
};

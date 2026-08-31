import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { publicMenuApi } from '../../api/public-menu.api';
import { Branch, Category, MenuItem, Table } from '../../types';
import { CategoryTabs } from '../../components/menu/CategoryTabs';
import { MenuItemDetailsModal } from '../../components/menu/MenuItemDetailsModal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { MapPin, Search, UtensilsCrossed, ArrowLeft, Star, Clock, Store, Phone } from 'lucide-react';

export const PublicMenuPage: React.FC = () => {
  const { branchId, tableId } = useParams<{ branchId?: string; tableId?: string }>();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId && !tableId) return;

    setIsLoading(true);

    if (tableId) {
      publicMenuApi
        .getTableMenuPublic(tableId, branchId)
        .then((res) => {
          setBranch(res.data.branch);
          setTable(res.data.table);
          setCategories(res.data.categories);
          setMenuItems(res.data.menuItems);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (branchId) {
      Promise.all([
        publicMenuApi.getBranchPublic(branchId),
        publicMenuApi.getBranchCategories(branchId),
        publicMenuApi.getBranchMenuItems(branchId),
      ])
        .then(([bRes, cRes, mRes]) => {
          setBranch(bRes.data);
          setCategories(cRes.data);
          setMenuItems(mRes.data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [branchId, tableId]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12 selection:bg-amber-500 selection:text-white">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-950 text-white pt-8 pb-10 px-4 sm:px-8 border-b border-slate-800 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <Link
              to="/public/branches"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Locations
            </Link>

            <Badge variant="success" size="md">Digital Menu Live</Badge>
          </div>

          {/* Restaurant & Branch Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-2">
              {/* Restaurant Name */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block">
                    Restaurant
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {branch?.tenantName || branch?.name || 'Digital Menu'}
                  </h1>
                </div>
              </div>

              {/* Branch & Table Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Branch: {branch?.name || 'Main Location'}</span>
                </span>

                {table && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-xl text-xs font-black text-purple-200">
                    Table #{table.tableNumber}
                  </span>
                )}

                {branch?.phone && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {branch.phone}
                  </span>
                )}
              </div>

              {/* Address */}
              {branch?.address && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <span>{branch.address}{branch.city ? `, ${branch.city}` : ''}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
        {/* Search & Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Input
            placeholder="Search dishes, ingredients, beverages..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </motion.div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-white rounded-3xl border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No Items Found"
            description="No dishes match your selected category or search keywords."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.isFeatured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-slate-950" /> Special
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 text-amber-400 font-black text-xs px-3 py-1 rounded-xl shadow-lg border border-slate-800">
                    ${item.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      {item.preparationTimeMinutes || 15} mins
                    </span>
                    <span className={item.isAvailable ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <MenuItemDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

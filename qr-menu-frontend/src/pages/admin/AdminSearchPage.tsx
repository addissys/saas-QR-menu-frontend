import React, { useState } from 'react';
import { menuItemApi } from '../../api/menu-item.api';
import { tenantApi } from '../../api/tenant.api';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { Search, Sparkles, Store, UtensilsCrossed } from 'lucide-react';

export const AdminSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ tenants: any[]; menuItems: any[] }>({
    tenants: [],
    menuItems: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const [tRes, mRes] = await Promise.all([tenantApi.getAll(), menuItemApi.getAllGlobal()]);
      const matchedTenants = tRes.data.filter((t: any) =>
        t.businessName.toLowerCase().includes(query.toLowerCase())
      );
      const matchedItems = mRes.data.filter(
        (i: any) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase())
      );

      setResults({ tenants: matchedTenants, menuItems: matchedItems });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Search Engine</h1>
        <p className="text-xs text-slate-500">Query across all tenants, branches, and food menu items</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search business names, dish titles, or keywords..."
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Execute Search</span>
        </button>
      </form>

      {isSearching ? (
        <div className="p-8 text-center text-xs text-slate-400">Searching global records...</div>
      ) : (
        <div className="space-y-6">
          {results.tenants.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-purple-600" />
                Matching Restaurant Tenants ({results.tenants.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {results.tenants.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{t.businessName}</span>
                    <span className="text-slate-400 font-mono">ID: {t.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.menuItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-purple-600" />
                Matching Menu Items ({results.menuItems.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {results.menuItems.map((i) => (
                  <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{i.name}</p>
                      <p className="text-slate-500 text-[11px]">{i.description}</p>
                    </div>
                    <span className="font-bold text-slate-900">${i.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

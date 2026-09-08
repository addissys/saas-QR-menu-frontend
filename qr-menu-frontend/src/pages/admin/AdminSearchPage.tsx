import React, { useState } from 'react';
import { adminApi } from '../../api/admin.api';

import { Input } from '../../components/ui/Input';

import {
  Search,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';

type TenantSearchResult = {
  id: string | number;
  businessName?: string;
  [key: string]: unknown;
};

type MenuItemSearchResult = {
  id: string | number;
  name?: string;
  description?: string;
  price?: number | string;
  [key: string]: unknown;
};

export const AdminSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const [results, setResults] = useState<{
    tenants: TenantSearchResult[];
    menuItems: MenuItemSearchResult[];
  }>({
    tenants: [],
    menuItems: [],
  });

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await adminApi.search(query.trim());

      setResults({
        tenants: ((data?.tenants ?? []) as unknown) as TenantSearchResult[],
        menuItems: ((data?.menuItems ?? []) as unknown) as MenuItemSearchResult[],
      });
    } catch (error) {
      console.error('Admin search error:', error);

      setResults({
        tenants: [],
        menuItems: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Global Search Engine
        </h1>

        <p className="text-xs text-slate-500">
          Search across all tenants, branches, and food menu items
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <Input
          placeholder="Search business names, dish titles, or keywords..."
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />

          <span>
            {isSearching ? 'Searching...' : 'Execute Search'}
          </span>
        </button>
      </form>

      {/* Loading */}
      {isSearching && (
        <div className="p-8 text-center text-xs text-slate-400">
          Searching global records...
        </div>
      )}

      {/* Results */}
      {!isSearching && hasSearched && (
        <div className="space-y-6">

          {/* Tenant Results */}
          {results.tenants.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">

              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-purple-600" />

                Matching Restaurant Tenants (
                {results.tenants.length}
                )
              </h3>

              <div className="divide-y divide-slate-100">

                {results.tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">
                      {tenant.businessName}
                    </span>

                    <span className="text-slate-400 font-mono">
                      ID: {tenant.id}
                    </span>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* Menu Item Results */}
          {results.menuItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">

              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-purple-600" />

                Matching Menu Items (
                {results.menuItems.length}
                )
              </h3>

              <div className="divide-y divide-slate-100">

                {results.menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >

                    <div>
                      <p className="font-bold text-slate-900">
                        {item.name}
                      </p>

                      {item.description && (
                        <p className="text-slate-500 text-[11px]">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <span className="font-bold text-slate-900">
                      {typeof item.price === 'number'
                        ? `$${item.price.toFixed(2)}`
                        : item.price}
                    </span>

                  </div>
                ))}

              </div>
            </div>
          )}

          {/* No Results */}
          {results.tenants.length === 0 &&
            results.menuItems.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                <Search className="h-8 w-8 mx-auto text-slate-300" />

                <h3 className="mt-3 font-bold text-slate-700">
                  No results found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Try searching with another business name,
                  dish name, or keyword.
                </p>

              </div>
            )}

        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { publicMenuApi } from '../../api/public-menu.api';
import { Branch } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Footer } from '../../components/layout/Footer';
import { Store, MapPin, Phone, Clock, Search, ArrowRight, QrCode } from 'lucide-react';

export const PublicBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    publicMenuApi
      .getPublicBranches()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBranches(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const safeBranches = Array.isArray(branches) ? branches : [];
  const filteredBranches = safeBranches.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-950 text-white py-12 px-6 shadow-xl border-b border-slate-800 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/60 border border-amber-800/80 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
            <QrCode className="h-3.5 w-3.5 text-amber-400" /> Guest Digital Menu Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Habesha Heritage Cuisine & Lounge</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Select your dining location to browse live digital menus, chef specials, prices, and allergen details.
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50"
        >
          <Input
            placeholder="Search branch location or address..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredBranches.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                <Store className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="font-bold text-sm text-slate-700">No Branch Locations Found</p>
                <p className="text-xs text-slate-400">Try adjusting your search criteria or check back later.</p>
              </div>
            ) : (
              filteredBranches.map((branch, idx) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 group-hover:text-amber-600 transition-colors">
                        <Store className="h-5 w-5 text-amber-500" />
                        {branch.name}
                      </h3>
                      <Badge variant="success" size="sm">Open Now</Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        {branch.address}{branch.city ? `, ${branch.city}` : ''}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        {branch.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        {branch.openingHours || '08:00 AM - 10:00 PM'}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/public/branches/${branch.id}/menu`}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-colors shadow-md shadow-amber-500/20"
                  >
                    <span>Explore Digital Menu</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

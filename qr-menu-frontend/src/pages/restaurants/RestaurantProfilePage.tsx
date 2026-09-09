import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantApi } from '../../api/tenant.api';
import { branchApi } from '../../api/branch.api';
import { tableApi } from '../../api/table.api';
import { categoryApi } from '../../api/category.api';
import { menuItemApi } from '../../api/menu-item.api';
import { userApi } from '../../api/user.api';
import { Tenant } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { normalizeRole } from '../../utils/roles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Store,
  DollarSign,
  Image,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Users,
  Shield,
  UtensilsCrossed,
  LayoutGrid,
  QrCode,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const RestaurantProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const normalizedRole = normalizeRole(user?.role);
  const canCreateRestaurant =
    normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'CAFE_OWNER';

  // Restaurant Basic Info Form State
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  // Resource Counts State
  const [branchCount, setBranchCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, branchesRes, tablesRes, catRes, itemsRes, mgrRes, staffRes] =
        await Promise.all([
          tenantApi.getProfile(),
          branchApi.getAll().catch(() => ({ data: [] })),
          tableApi.getAll().catch(() => ({ data: [] })),
          categoryApi.getAll().catch(() => []),
          menuItemApi.getAll().catch(() => ({ data: [] })),
          userApi.getBranchManagers().catch(() => ({ data: [] })),
          userApi.getStaff().catch(() => ({ data: [] })),
        ]);

      if (profileRes.data) {
        setTenant(profileRes.data);
        setBusinessName(profileRes.data.businessName || '');
        setEmail(profileRes.data.email || '');
        setPhone(profileRes.data.phone || '');
        setAddress(profileRes.data.address || '');
        setCity(profileRes.data.city || '');
        setCountry(profileRes.data.country || 'Ethiopia');
        setCurrencySymbol(profileRes.data.currencySymbol || '$');
        setLogoUrl(profileRes.data.logoUrl || '');
        setDescription(profileRes.data.description || '');
      }

      setBranchCount(branchesRes.data.length);
      setTableCount(tablesRes.data.length);
      setCategoryCount(Array.isArray(catRes) ? catRes.length : 0);
      setItemCount(itemsRes.data.length);
      setManagerCount(mgrRes.data.length);
      setStaffCount(staffRes.data.length);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      showToast('Business / Restaurant Name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (tenant) {
        const res = await tenantApi.update(tenant.id, {
          businessName: businessName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          currencySymbol: currencySymbol.trim(),
          logoUrl: logoUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
        setTenant(res.data);
        showToast('Restaurant profile details saved successfully', 'success');
      } else {
        if (!canCreateRestaurant) {
          showToast('You do not have permission to create a restaurant.', 'error');
          return;
        }
        const res = await tenantApi.create({
          businessName: businessName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          currencySymbol: currencySymbol.trim(),
          logoUrl: logoUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
        setTenant(res.data);
        showToast('Restaurant profile created successfully', 'success');
      }
      await useAuthStore.getState().refreshCurrentUser();
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to save profile';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant && !isLoading && !canCreateRestaurant) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Your role ({user?.role?.replace(/_/g, ' ') || 'Staff'}) does not have permission to create or register a restaurant organization.
        </p>
      </div>
    );
  }

  const isOnboardingIncomplete = user?.role === 'CAFE_OWNER' && user?.isOnboardingCompleted === false;

  return (
    <div className="space-y-8 font-sans max-w-6xl">
      {isOnboardingIncomplete && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Store className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-amber-900">Mandatory Onboarding: Complete Your Restaurant Profile</p>
            <p className="text-amber-800">
              Welcome to the platform! Please enter and save your restaurant master information below to complete setup and unlock access to your portal dashboard and management features.
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tenant ? tenant.businessName : 'Restaurant Organization Profile'}
            </h1>
            {tenant && (
              <Badge variant={tenant.isActive ? 'success' : 'neutral'} size="sm">
                {tenant.status || 'ACTIVE'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Manage your restaurant master metadata and view connected venues, menus, and staff
          </p>
        </div>

        {tenant?.businessSlug && (
          <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs font-bold text-amber-900">
            Slug: <span className="font-mono text-amber-700">{tenant.businessSlug}</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* RESTAURANT MASTER INFORMATION FORM */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Store className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Restaurant Master Information
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading business profile...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business / Restaurant Name *"
                  placeholder="Artisan Bistro & Cafe"
                  icon={Store}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />

                <Input
                  label="Currency Symbol *"
                  placeholder="$ or ETB"
                  icon={DollarSign}
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email Address"
                  type="email"
                  placeholder="contact@restaurant.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Contact Phone Number"
                  placeholder="+251 91 123 4567"
                  icon={Phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Input
                label="Physical Address / Headquarters"
                placeholder="Main Boulevard, Street 12"
                icon={MapPin}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="Addis Ababa"
                  icon={Building}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Input
                  label="Country"
                  placeholder="Ethiopia"
                  icon={Globe}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <Input
                label="Logo Image URL"
                placeholder="https://images.unsplash.com/..."
                icon={Image}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Restaurant Description / Cuisine Summary
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Handcrafted espresso, artisan bakery, gourmet cuisine..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  icon={Save}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
                >
                  {tenant ? 'Save Restaurant Profile' : 'Create Restaurant Profile'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

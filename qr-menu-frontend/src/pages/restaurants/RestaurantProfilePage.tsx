import React, { useEffect, useState } from 'react';
import { tenantApi } from '../../api/tenant.api';
import { Tenant } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Store, DollarSign, Image, FileText, Save } from 'lucide-react';

export const RestaurantProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setIsLoading(true);
    tenantApi
      .getProfile()
      .then((res) => {
        setTenant(res.data);
        setBusinessName(res.data.businessName);
        setCurrencySymbol(res.data.currencySymbol || '$');
        setLogoUrl(res.data.logoUrl || '');
        setDescription(res.data.description || '');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setIsSaving(true);
    try {
      await tenantApi.update(tenant.id, {
        businessName,
        currencySymbol,
        logoUrl,
        description,
      });
      showToast('Restaurant details saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Restaurant Organization Profile</h1>
        <p className="text-xs text-slate-500">
          Configure branding, currency symbols, and master details for your restaurant account
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading business profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="$"
              icon={DollarSign}
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              required
            />

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
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Handcrafted espresso, fresh pastas, organic salads..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSaving} icon={Save}>
                Save Organization Profile
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

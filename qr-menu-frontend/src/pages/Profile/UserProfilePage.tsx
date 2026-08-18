import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, ShieldCheck, Save } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile information saved successfully', 'success');
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">User Profile Settings</h1>
        <p className="text-xs text-slate-500">Manage your personal account credentials and contact details</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-500 font-mono mb-1">{user?.email}</p>
            <Badge variant="purple" size="sm">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Role: {user?.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="John Doe"
            icon={User}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Account ID)"
            type="email"
            icon={Mail}
            value={email}
            disabled
            helperText="Email address cannot be modified once registered"
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 019-2834"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              icon={Save}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
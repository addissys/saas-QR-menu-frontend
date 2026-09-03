import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { branchApi } from '../../api/branch.api';
import { Branch } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table, Column } from '../../components/ui/Table';
import { Plus, GitBranch, MapPin, Phone, Clock, Edit3, Trash2, ExternalLink, ShieldCheck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BranchesListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBranches = () => {
    setIsLoading(true);
    branchApi
      .getAll()
      .then((res) => setBranches(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setName('');
    setAddress('');
    setCity('');
    setPhone('');
    setOpeningHours('08:00 AM - 10:00 PM');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setCity(branch.city || '');
    setPhone(branch.phone);
    setOpeningHours(branch.openingHours || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      showToast('City is required', 'error');
      return;
    }
    try {
      if (editingBranch) {
        await branchApi.update(editingBranch.id, { name, address, city, phone, openingHours });
        showToast('Branch updated successfully', 'success');
      } else {
        await branchApi.create({
          tenantId: user?.tenantId || '',
          name,
          address,
          city,
          phone,
          openingHours
        });
        showToast('New branch created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      let msg = err?.response?.data?.message ?? err?.message ?? 'Failed to save branch';
      const errorsObj = err?.response?.data?.errors;
      if (errorsObj?.fieldErrors) {
        const details = Object.entries(errorsObj.fieldErrors)
          .map(([field, msgs]: [string, any]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('; ');
        if (details) msg = `Validation failed — ${details}`;
      }
      showToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await branchApi.delete(deletingId);
      showToast('Branch deleted', 'success');
      setDeletingId(null);
      fetchBranches();
    } catch (err) {
      showToast('Failed to delete branch', 'error');
    }
  };

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Name',
      accessor: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">{b.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">ID: {b.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Address',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <MapPin className="h-3.5 w-3.5 text-amber-500" />
          {b.address}{b.city ? `, ${b.city}` : ''}
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Phone className="h-3.5 w-3.5 text-amber-500" />
          {b.phone}
        </span>
      ),
    },
    {
      header: 'Opening Hours',
      accessor: (b) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          {b.openingHours || 'Default (08:00 - 22:00)'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (b) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/public/branches/${b.id}/menu`}
            target="_blank"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
            title="Preview Live Menu"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleOpenEdit(b)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingId(b.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Role-based filtering: Executive and Branch Managers only see their assigned branches
  const displayBranches =
    user?.assignedBranchIds && user.assignedBranchIds.length > 0
      ? branches.filter((b) => user.assignedBranchIds?.includes(b.id))
      : branches;

  return (
    <div className="space-y-6 font-sans">
      {user?.role === 'EXECUTIVE' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-amber-900 shadow-sm"
        >
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Executive Multi-Branch Scope</p>
            <p className="text-amber-800">
              Showing {displayBranches.length} assigned branch location(s) under your operational scope ({user.assignedBranchIds?.join(', ')}).
            </p>
          </div>
        </motion.div>
      )}

      {user?.role === 'BRANCH_MANAGER' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center gap-3 text-sky-900 shadow-sm"
        >
          <Building2 className="h-5 w-5 text-sky-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Single-Branch Manager Scope</p>
            <p className="text-sky-800">
              Showing operations for your assigned venue ({displayBranches[0]?.name || 'Current Branch'}).
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900">Branch Locations</h1>
          <p className="text-xs text-slate-500">Manage multiple restaurant venues and contact information</p>
        </div>
        {user?.role !== 'BRANCH_MANAGER' && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
            >
              Add New Branch
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading branch locations...</div>
        ) : (
          <Table columns={columns} data={displayBranches} emptyMessage="No branch locations configured for your account scope" />
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Edit Branch' : 'Create New Branch'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Branch Location Name *"
            placeholder="e.g. Downtown Flagship"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Street Address *"
            placeholder="123 Main Street, Suite 100"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            label="City *"
            placeholder="e.g. Addis Ababa"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            label="Phone Number *"
            placeholder="+251 9_________"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Opening Hours"
            placeholder="Mon-Sun: 08:00 AM - 10:00 PM"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20">
              {editingBranch ? 'Save Changes' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message="Are you sure you want to delete this branch location? Tables and menus associated with it will be affected."
      />
    </div>
  );
};

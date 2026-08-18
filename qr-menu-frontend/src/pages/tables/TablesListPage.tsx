import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/table.api';
import { branchApi } from '../../api/branch.api';
import { Table as TableType, Branch } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { PrintableQRModal } from '../../components/qr/PrintableQRModal';
import { Plus, Table as TableIcon, QrCode, Edit3, Trash2, Users, Printer, FileText } from 'lucide-react';

export const TablesListPage: React.FC = () => {
  const { showToast } = useToast();
  const [tables, setTables] = useState<TableType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [branchId, setBranchId] = useState('');

  // Print PDF Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTableTarget, setPrintTableTarget] = useState<TableType | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTablesAndBranches = () => {
    setIsLoading(true);
    Promise.all([tableApi.getAll(), branchApi.getAll()])
      .then(([tRes, bRes]) => {
        setTables(tRes.data);
        setBranches(bRes.data);
        if (bRes.data.length > 0 && !branchId) {
          setBranchId(bRes.data[0].id);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTablesAndBranches();
  }, []);

  const handleOpenCreate = () => {
    setEditingTable(null);
    setTableNumber('');
    setCapacity('4');
    setBranchId(branches[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (table: TableType) => {
    setEditingTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(table.capacity?.toString() || '4');
    setBranchId(table.branchId);
    setIsModalOpen(true);
  };

  const handleOpenPrintForTable = (table: TableType) => {
    setPrintTableTarget(table);
    setIsPrintModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await tableApi.update(editingTable.id, {
          tableNumber,
          capacity: parseInt(capacity) || 4,
          branchId,
        });
        showToast('Table updated successfully', 'success');
      } else {
        await tableApi.create({
          tableNumber,
          capacity: parseInt(capacity) || 4,
          branchId,
        });
        showToast('New table created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchTablesAndBranches();
    } catch (err) {
      showToast('Failed to save table', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await tableApi.delete(deletingId);
      showToast('Table removed', 'success');
      setDeletingId(null);
      fetchTablesAndBranches();
    } catch (err) {
      showToast('Failed to delete table', 'error');
    }
  };

  const columns: Column<TableType>[] = [
    {
      header: 'Table Identification',
      accessor: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Table #{t.tableNumber}</p>
            <p className="text-[10px] text-slate-400">ID: {t.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Branch Location',
      accessor: (t) => {
        const branch = branches.find((b) => b.id === t.branchId);
        return <span className="font-medium text-slate-700">{branch?.name || t.branchId}</span>;
      },
    },
    {
      header: 'Seating Capacity',
      accessor: (t) => (
        <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {t.capacity || 4} Guests
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="success" size="sm">Active QR</Badge>,
    },
    {
      header: 'Actions',
      accessor: (t) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenPrintForTable(t)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
            title="Download or Print PDF Table Card"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PDF Card</span>
          </button>

          <button
            onClick={() => handleOpenEdit(t)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Edit Table"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingId(t.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
            title="Delete Table"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Tables</h1>
          <p className="text-xs text-slate-500">Configure dining tables & print physical menu cards for tables</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={() => {
              setPrintTableTarget(null);
              setIsPrintModalOpen(true);
            }}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold"
          >
            Batch Print Cards PDF
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
            Add Dining Table
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading tables catalog...</div>
        ) : (
          <Table columns={columns} data={tables} emptyMessage="No dining tables configured" />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit Table Details' : 'Add Dining Table'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Assign to Branch Location *"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={branches.map((b) => ({ label: b.name, value: b.id }))}
            required
          />
          <Input
            label="Table Number / Code *"
            placeholder="e.g. 12 or T-04"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />
          <Input
            label="Seating Capacity (Guests)"
            type="number"
            placeholder="4"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingTable ? 'Save Table' : 'Add Table'}
            </Button>
          </div>
        </form>
      </Modal>

      <PrintableQRModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintTableTarget(null);
        }}
        branches={branches}
        tables={tables}
        defaultBranchId={printTableTarget?.branchId}
        defaultTableId={printTableTarget?.id}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Dining Table"
        message="Are you sure you want to remove this table? Any printed QR code linked to this table will no longer direct guests to this specific table."
      />
    </div>
  );
};

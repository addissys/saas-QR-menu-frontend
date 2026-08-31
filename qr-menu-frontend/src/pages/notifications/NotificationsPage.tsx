import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationApi } from '../../api/notification.api';
import { Notification } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  Bell,
  CheckCheck,
  Clock,
  ShieldAlert,
  QrCode,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'TABLE_SERVICE' | 'ALERT' | 'INFO'>('ALL');

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getAll();
      const notifList = Array.isArray(res.data) ? res.data : [];
      setNotifications(notifList);
      // Prune selected IDs that no longer exist
      setSelectedIds((prev) => prev.filter((id) => notifList.some((n) => n.id === id)));
    } catch (err) {
      showToast('Failed to load notifications', 'error');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      showToast('Notification marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      showToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  // Delete single notification
  const handleDeleteSingle = async () => {
    if (!deletingId) return;
    setIsActionLoading(true);
    try {
      await notificationApi.delete(deletingId);
      showToast('Notification deleted successfully', 'success');
      setDeletingId(null);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete selected notifications
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsActionLoading(true);
    try {
      await notificationApi.deleteSelected(selectedIds);
      showToast(`Deleted ${selectedIds.length} notification(s)`, 'success');
      setSelectedIds([]);
      setIsDeleteSelectedModalOpen(false);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete selected notifications', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    setIsActionLoading(true);
    try {
      await notificationApi.deleteAll();
      showToast('All notifications have been deleted', 'success');
      setSelectedIds([]);
      setIsDeleteAllModalOpen(false);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to clear notifications', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Restore demo notifications
  const handleRestoreSample = async () => {
    setIsActionLoading(true);
    try {
      await notificationApi.restoreSample();
      showToast('Sample notifications restored', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to restore notifications', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Selection toggle handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'UNREAD') return !notif.isRead;
    if (activeFilter === 'TABLE_SERVICE') return notif.type === 'TABLE_SERVICE';
    if (activeFilter === 'ALERT') return notif.type === 'ALERT';
    if (activeFilter === 'INFO') return notif.type === 'INFO';
    return true;
  });

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredNotifications.map((n) => n.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isAllFilteredSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.includes(n.id));

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">Platform Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time alerts, table QR scans, menu updates, and staff notifications
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={CheckCheck}
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                Clear All
              </Button>
            </>
          )}

          {notifications.length === 0 && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRestoreSample}
              className="text-xs font-bold border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100/70"
            >
              Restore Sample Alerts
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs & Bulk Actions Toolbar */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        >
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'UNREAD'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('TABLE_SERVICE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'TABLE_SERVICE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Table Scans ({notifications.filter((n) => n.type === 'TABLE_SERVICE').length})
            </button>
            <button
              onClick={() => setActiveFilter('ALERT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'ALERT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Alerts ({notifications.filter((n) => n.type === 'ALERT').length})
            </button>
          </div>

          {/* Bulk Selection Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            {filteredNotifications.length > 0 && (
              <button
                onClick={toggleSelectAllFiltered}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {isAllFilteredSelected ? (
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>{isAllFilteredSelected ? 'Deselect All' : 'Select All'}</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setIsDeleteSelectedModalOpen(true)}
                  className="text-xs font-extrabold shadow-sm"
                >
                  Delete Selected ({selectedIds.length})
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white rounded-3xl border border-slate-200/80 animate-pulse shadow-xs" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto shadow-inner">
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-extrabold text-slate-900">
              {notifications.length === 0
                ? 'No Notifications Remaining'
                : 'No Notifications in this Category'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {notifications.length === 0
                ? 'You have deleted or cleared all notifications. New table QR scans and system alerts will appear here.'
                : 'There are no notifications matching your active filter criteria.'}
            </p>
          </div>
          {notifications.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleRestoreSample}
              className="mt-2 text-xs font-bold border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-xs"
            >
              Generate Demo Notifications
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/40 divide-y divide-slate-100 overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => {
              const isSelected = selectedIds.includes(notif.id);

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0, transition: { duration: 0.25 } }}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-all group ${
                    isSelected
                      ? 'bg-amber-50/60'
                      : !notif.isRead
                      ? 'bg-amber-50/20 hover:bg-amber-50/35'
                      : 'bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Checkbox for Bulk Action */}
                    <button
                      onClick={() => toggleSelect(notif.id)}
                      className="pt-1 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                      aria-label="Select notification"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-amber-600" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>

                    {/* Icon Badge */}
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 border ${
                        notif.type === 'ALERT'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : notif.type === 'TABLE_SERVICE'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}
                    >
                      {notif.type === 'ALERT' ? (
                        <ShieldAlert className="h-5 w-5 stroke-[2.2]" />
                      ) : notif.type === 'TABLE_SERVICE' ? (
                        <QrCode className="h-5 w-5 stroke-[2.2]" />
                      ) : (
                        <Bell className="h-5 w-5 stroke-[2.2]" />
                      )}
                    </div>

                    {/* Notification Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <Badge variant="amber" size="sm">
                            New
                          </Badge>
                        )}
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.2 border border-slate-200 rounded">
                          {notif.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed break-words">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 pt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column (Mark Read + Delete Button) */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center sm:self-start pt-1">
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs font-bold text-amber-600 hover:bg-amber-100/60 hover:text-amber-700 hidden sm:inline-flex"
                      >
                        Mark Read
                      </Button>
                    )}

                    {/* Delete Notification Button */}
                    <button
                      onClick={() => setDeletingId(notif.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Single Notification Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete Notification"
        variant="danger"
        isLoading={isActionLoading}
      />

      {/* Delete Selected Notifications Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteSelectedModalOpen}
        onClose={() => setIsDeleteSelectedModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title={`Delete ${selectedIds.length} Notification(s)`}
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected notification(s)?`}
        confirmText={`Delete (${selectedIds.length})`}
        variant="danger"
        isLoading={isActionLoading}
      />

      {/* Delete All Notifications Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Clear All Notifications"
        message={`Are you sure you want to permanently clear all ${notifications.length} notifications?`}
        confirmText="Clear All"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};


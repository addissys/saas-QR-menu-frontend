import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationApi } from '../../api/notification.api';
import { Notification } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Bell, CheckCircle2, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

export const NotificationsListPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const fetchNotifications = () => {
    setIsLoading(true);
    notificationApi
      .getAll()
      .then((res) => setNotifications(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      showToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await notificationApi.delete(deletingId);
      showToast('Notification deleted', 'success');
      setDeletingId(null);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationApi.deleteAll();
      showToast('All notifications cleared', 'success');
      setIsDeleteAllOpen(false);
      fetchNotifications();
    } catch (err) {
      showToast('Failed to clear notifications', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Notifications</h1>
          <p className="text-xs text-slate-500">System alerts, audit events, and platform activity</p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button variant="outline" size="sm" icon={CheckCircle2} onClick={handleMarkAllRead}>
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteAllOpen(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No notifications found</p>
            <p className="text-xs text-slate-500">All system notifications have been cleared.</p>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={async () => {
                await notificationApi.restoreSample();
                fetchNotifications();
              }}
              className="text-xs border-amber-300 bg-amber-50 text-amber-900"
            >
              Restore Samples
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  !n.isRead ? 'bg-amber-50/30' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      n.type === 'ALERT'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {n.type === 'ALERT' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                </div>

                <button
                  onClick={() => setDeletingId(n.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications?"
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  );
};


import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

/**
 * ToastRenderer renders the floating toast notification list.
 * It reads from the Zustand useToastStore — no Context provider needed.
 * Mount this once at the root of the app (inside App.tsx).
 */
export const ToastRenderer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-medium transition-all duration-200 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="h-4 w-4 text-purple-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

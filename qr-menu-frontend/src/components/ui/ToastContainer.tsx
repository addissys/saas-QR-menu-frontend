import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
    info: 'border-sky-200 bg-sky-50/90 text-sky-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 pointer-events-auto ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium flex-1">{toast.text}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
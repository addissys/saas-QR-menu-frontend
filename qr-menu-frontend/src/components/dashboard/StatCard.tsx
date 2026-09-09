import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'emerald' | 'amber';
  onClick?: () => void;
  clickableHint?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  onClick,
  clickableHint,
}) => {
  const colorMap = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-5 flex items-start justify-between gap-4 transition-all ${
        onClick
          ? 'cursor-pointer hover:shadow-xl hover:border-purple-400 hover:-translate-y-0.5 active:translate-y-0 group focus:outline-hidden focus:ring-2 focus:ring-purple-500/40'
          : 'hover:shadow-lg'
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        {onClick && (
          <p className="text-[11px] font-bold text-purple-600 group-hover:text-purple-700 pt-1.5 flex items-center gap-1">
            <span>{clickableHint || 'View full list'}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl border shrink-0 shadow-xs transition-transform group-hover:scale-105 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};

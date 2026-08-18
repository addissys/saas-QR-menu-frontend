import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
}) => {
  const colorMap = {
    purple: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-xl hover:border-amber-300 transition-all p-5 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl border shrink-0 shadow-xs ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};

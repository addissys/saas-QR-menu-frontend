import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-100 text-rose-700 border-rose-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-bold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};

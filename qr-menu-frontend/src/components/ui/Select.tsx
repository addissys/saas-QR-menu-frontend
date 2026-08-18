import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', id, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
};
import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  showPasswordToggle = false,
  className = '',
  id,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const inputType = showPasswordToggle && props.type === 'password' && isPasswordVisible ? 'text' : props.type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          {...props}
          type={inputType}
          className={`w-full bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors ${
            Icon ? 'pl-10' : 'px-3.5'
          } ${showPasswordToggle && props.type === 'password' ? 'pr-10' : 'pr-3.5'} py-2.5 ${error ? 'border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
        />
        {showPasswordToggle && props.type === 'password' && (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute right-3 text-slate-400 hover:text-slate-700"
          >
            {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full py-2.5 pr-4 ${
              icon ? 'pl-11' : 'pl-4'
            } rounded-xl glass-input text-sm font-medium transition-all focus:outline-none focus:ring-0 ${
              error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold text-red-400 mt-0.5"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

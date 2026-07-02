import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyle =
    'relative py-2.5 px-5 rounded-xl text-sm font-semibold tracking-wide transition-all select-none overflow-hidden flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primary/95 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] disabled:bg-brand-primary/40 disabled:text-white/50 disabled:shadow-none',
    secondary:
      'bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 disabled:bg-white/2 disabled:text-zinc-600 disabled:border-transparent',
    ghost:
      'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5 disabled:text-zinc-600 disabled:bg-transparent',
  };

  return (
    <motion.div
      whileHover={isLoading || props.disabled ? {} : { scale: 1.015 }}
      whileTap={isLoading || props.disabled ? {} : { scale: 0.985 }}
      className="w-full"
    >
      <button
        className={`${baseStyle} ${variants[variant]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </button>
    </motion.div>
  );
};

export default Button;

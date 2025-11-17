'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'cursor-can-hover cursor-pointer font-medium transition-all duration-300 rounded-full inline-flex items-center justify-center gap-2';

    const variantStyles = {
      primary: 'bg-white text-black hover:bg-gray-100 shadow-sm',
      secondary: 'bg-gray-500/20 text-white hover:bg-gray-500/30 border border-white/20',
      ghost: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    };

    const sizeStyles = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:bg-gray-500/20';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          disabledStyles,
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

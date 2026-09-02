/**
 * Button Primitive Component
 * 
 * Restrained monochrome button with controlled blue accent only on primary variant.
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 13.2, 15.1, 15.2
 */

import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-body font-medium transition-all duration-base focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-accent-primary text-white hover:bg-accent-hover active:scale-[0.98]',
    secondary: 'bg-background-surface text-text-primary border-2 border-status-subtle hover:border-accent-primary hover:text-accent-primary active:scale-[0.98]',
    outline: 'bg-transparent text-accent-primary border-2 border-accent-primary hover:bg-accent-light active:scale-[0.98]',
    ghost: 'bg-transparent text-text-primary hover:bg-status-subtle active:scale-[0.98]'
  };
  
  const sizeStyles = {
    sm: 'text-sm px-4 py-2 rounded-md',
    md: 'text-base px-6 py-3 rounded-lg',
    lg: 'text-lg px-8 py-4 rounded-xl'
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

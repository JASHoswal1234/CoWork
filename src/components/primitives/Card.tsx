/**
 * Card Primitive Component
 * 
 * Large rounded containers following the bento-style design system.
 * 
 * Validates Requirements: 2.2, 2.3, 13.2, 15.1
 */

import React, { HTMLAttributes } from 'react';

type CardVariant = 'bento' | 'container' | 'elevated';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

export function Card({
  variant = 'bento',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-background-surface transition-transform duration-base';
  
  const variantStyles = {
    bento: 'rounded-lg',           // 24px border radius
    container: 'rounded-xl',        // 40px border radius
    elevated: 'rounded-lg shadow-md'
  };
  
  const paddingStyles = {
    sm: 'p-4',    // 16px
    md: 'p-6',    // 24px
    lg: 'p-8'     // 32px
  };
  
  const interactiveStyles = interactive
    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
    : '';
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

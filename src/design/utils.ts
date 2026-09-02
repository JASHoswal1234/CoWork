/**
 * Design Token Utilities
 * 
 * Helper functions for working with design tokens in components.
 */

import { colors, spacing, borderRadius, typography, breakpoints } from './tokens';

/**
 * Generate media query string from breakpoint
 * 
 * @example
 * const styles = {
 *   [mediaQuery('md')]: {
 *     fontSize: '2rem'
 *   }
 * };
 */
export const mediaQuery = (breakpoint: keyof typeof breakpoints): string => {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
};

/**
 * Generate multiple spacing values
 * 
 * @example
 * // Vertical and horizontal padding
 * const padding = spacingMultiple('md', 'xl'); // "1rem 2rem"
 */
export const spacingMultiple = (...values: (keyof typeof spacing)[]): string => {
  return values.map(v => spacing[v]).join(' ');
};

/**
 * Combine multiple font properties into a single string
 * 
 * @example
 * const heroFont = fontStyle('extrabold', '4xl', 'body');
 * // Returns: "800 3.5rem 'Inter', ..."
 */
export const fontStyle = (
  weight: keyof typeof typography.fontWeight,
  size: keyof typeof typography.fontSize,
  family: keyof typeof typography.fontFamily = 'body'
): string => {
  return `${typography.fontWeight[weight]} ${typography.fontSize[size]} ${typography.fontFamily[family]}`;
};

/**
 * Generate CSS custom properties from tokens
 * Useful for setting up global CSS variables
 * 
 * @example
 * // In your global CSS or root component:
 * const cssVars = generateCSSVariables();
 */
export const generateCSSVariables = () => {
  return {
    // Colors
    '--color-bg-primary': colors.background.primary,
    '--color-bg-surface': colors.background.surface,
    '--color-bg-overlay': colors.background.overlay,
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-tertiary': colors.text.tertiary,
    '--color-text-navy': colors.text.navy,
    '--color-accent-primary': colors.accent.primary,
    '--color-accent-hover': colors.accent.hover,
    '--color-accent-light': colors.accent.light,
    '--color-status-neutral': colors.status.neutral,
    '--color-status-subtle': colors.status.subtle,
    '--color-cooperative': colors.cooperative.primary,
    
    // Spacing
    '--spacing-xs': spacing.xs,
    '--spacing-sm': spacing.sm,
    '--spacing-md': spacing.md,
    '--spacing-lg': spacing.lg,
    '--spacing-xl': spacing.xl,
    '--spacing-2xl': spacing['2xl'],
    '--spacing-3xl': spacing['3xl'],
    '--spacing-4xl': spacing['4xl'],
    
    // Border Radius
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
    '--radius-xl': borderRadius.xl,
    '--radius-full': borderRadius.full,
    
    // Typography
    '--font-body': typography.fontFamily.body,
    '--font-mono': typography.fontFamily.mono,
    '--font-size-xs': typography.fontSize.xs,
    '--font-size-sm': typography.fontSize.sm,
    '--font-size-base': typography.fontSize.base,
    '--font-size-lg': typography.fontSize.lg,
    '--font-size-xl': typography.fontSize.xl,
    '--font-size-2xl': typography.fontSize['2xl'],
    '--font-size-3xl': typography.fontSize['3xl'],
    '--font-size-4xl': typography.fontSize['4xl'],
    '--font-weight-normal': typography.fontWeight.normal,
    '--font-weight-medium': typography.fontWeight.medium,
    '--font-weight-semibold': typography.fontWeight.semibold,
    '--font-weight-extrabold': typography.fontWeight.extrabold,
  };
};

/**
 * Type-safe color accessor with fallback
 */
export const getColor = (
  category: keyof typeof colors,
  variant: string,
  fallback: string = colors.text.primary
): string => {
  const colorGroup = colors[category] as Record<string, string>;
  return colorGroup?.[variant] || fallback;
};

/**
 * Type-safe spacing accessor with fallback
 */
export const getSpacing = (
  size: keyof typeof spacing,
  fallback: string = spacing.md
): string => {
  return spacing[size] || fallback;
};

/**
 * Convert rem values to pixels for calculations
 * Assumes 1rem = 16px (browser default)
 */
export const remToPx = (remValue: string): number => {
  const value = parseFloat(remValue);
  return value * 16;
};

/**
 * Convert pixels to rem values
 * Assumes 1rem = 16px (browser default)
 */
export const pxToRem = (pxValue: number): string => {
  return `${pxValue / 16}rem`;
};

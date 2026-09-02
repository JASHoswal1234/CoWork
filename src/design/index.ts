/**
 * Design System Entry Point
 * 
 * Re-exports all design tokens and utilities for convenient importing.
 * 
 * @example
 * // Import everything
 * import { colors, spacing, tokens } from '@/design';
 * 
 * // Import utilities
 * import { mediaQuery, fontStyle } from '@/design';
 */

// Export all tokens
export {
  colors,
  spacing,
  borderRadius,
  typography,
  breakpoints,
  transitions,
  zIndex,
  shadows,
  tokens,
} from './tokens';

// Export token types
export type {
  ColorToken,
  SpacingToken,
  BorderRadiusToken,
  TypographyToken,
  BreakpointToken,
  TransitionToken,
  ZIndexToken,
  ShadowToken,
} from './tokens';

// Export utilities
export {
  mediaQuery,
  spacingMultiple,
  fontStyle,
  generateCSSVariables,
  getColor,
  getSpacing,
  remToPx,
  pxToRem,
} from './utils';

// Default export is the tokens bundle
export { default } from './tokens';

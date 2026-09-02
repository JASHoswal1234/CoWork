/**
 * Design Tokens for SAHAKAR // SERVICES
 * 
 * Restrained monochrome design system with controlled blue accent.
 * Follows the premium, minimalist editorial interface specifications.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 13.1
 */

/**
 * Color Palette
 * 
 * Restrained monochrome palette:
 * - Off-white backgrounds (#F7F7F7)
 * - Black/navy text (#121212, #0A1929)
 * - Controlled blue accent (#174A8B) - use sparingly for primary actions only
 */
export const colors = {
  background: {
    primary: '#F7F7F7',       // Off-white - main background
    surface: '#FFFFFF',        // Pure white - for cards and containers
    overlay: 'rgba(0,0,0,0.4)' // Dark overlay for modals
  },
  text: {
    primary: '#121212',        // Near black - primary text
    secondary: '#4A4A4A',      // Medium gray - secondary text
    tertiary: '#8B8B8B',       // Light gray - tertiary text
    navy: '#0A1929'            // Navy - for large headings
  },
  accent: {
    primary: '#174A8B',        // Controlled blue - primary actions only
    hover: '#0D3A6F',          // Darker blue - hover states
    light: '#E8F0F8'           // Light blue - subtle backgrounds
  },
  status: {
    neutral: '#8B8B8B',        // Default status indicator
    subtle: '#E5E5E5'          // Subtle borders and dividers
  },
  cooperative: {
    primary: '#174A8B'         // Brand color for cooperative identity
  }
} as const;

/**
 * Spacing Scale
 * 
 * Generous whitespace following 4px base unit.
 * Use larger values (xl, 2xl, 3xl, 4xl) for editorial layouts.
 */
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem'     // 96px
} as const;

/**
 * Border Radius Values
 * 
 * Large rounded corners for premium feel:
 * - lg (24px) - bento-style cards
 * - xl (40px) - large containers
 */
export const borderRadius = {
  sm: '8px',         // Small elements
  md: '16px',        // Medium elements
  lg: '24px',        // Bento cards
  xl: '40px',        // Large containers
  full: '9999px'     // Pills and circular elements
} as const;

/**
 * Typography Configuration
 * 
 * Font families:
 * - Inter: Body text with weights 400, 500, 600, 800
 * - JetBrains Mono: Labels and technical elements
 * 
 * Large bold headlines at 3.5rem (56px) with weight 800
 */
export const typography = {
  fontFamily: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace"
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
    '4xl': '3.5rem'     // 56px - Hero headlines
  },
  fontWeight: {
    normal: 400,        // Regular body text
    medium: 500,        // Medium emphasis
    semibold: 600,      // Semibold emphasis
    extrabold: 800      // Large headlines
  },
  lineHeight: {
    tight: 1.2,         // Headlines
    normal: 1.5,        // Body text
    relaxed: 1.75       // Spacious content
  },
  letterSpacing: {
    tight: '-0.02em',   // Headlines
    normal: '0',        // Body text
    wide: '0.05em'      // Labels and mono text
  }
} as const;

/**
 * Breakpoints for Responsive Design
 * 
 * Mobile-first responsive design principles.
 * Design for mobile, enhance for larger screens.
 */
export const breakpoints = {
  sm: '640px',       // Small devices (large phones)
  md: '768px',       // Medium devices (tablets)
  lg: '1024px',      // Large devices (laptops)
  xl: '1280px'       // Extra large devices (desktops)
} as const;

/**
 * Animation Durations
 * 
 * Subtle transitions under 300ms for responsive feel.
 */
export const transitions = {
  fast: '150ms',     // Quick micro-interactions
  base: '200ms',     // Standard transitions
  slow: '300ms'      // Larger state changes
} as const;

/**
 * Z-Index Scale
 * 
 * Layering system for overlays, modals, and dropdowns.
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
} as const;

/**
 * Shadow System
 * 
 * Subtle shadows for elevation.
 * Use sparingly in restrained monochrome design.
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
} as const;

/**
 * Type Exports
 * 
 * Export types for TypeScript autocomplete and type safety.
 */
export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
export type TypographyToken = typeof typography;
export type BreakpointToken = typeof breakpoints;
export type TransitionToken = typeof transitions;
export type ZIndexToken = typeof zIndex;
export type ShadowToken = typeof shadows;

/**
 * Design Tokens Bundle
 * 
 * Export all tokens as a single object for convenient importing.
 */
export const tokens = {
  colors,
  spacing,
  borderRadius,
  typography,
  breakpoints,
  transitions,
  zIndex,
  shadows
} as const;

export default tokens;

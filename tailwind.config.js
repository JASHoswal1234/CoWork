/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Color System
      colors: {
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
      },

      // Spacing Scale
      spacing: {
        'xs': '0.25rem',    // 4px
        'sm': '0.5rem',     // 8px
        'md': '1rem',       // 16px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '3rem',      // 48px
        '3xl': '4rem',      // 64px
        '4xl': '6rem'       // 96px
      },

      // Border Radius
      borderRadius: {
        'sm': '8px',         // Small elements
        'md': '16px',        // Medium elements
        'lg': '24px',        // Bento cards
        'xl': '40px',        // Large containers
        'full': '9999px'     // Pills and circular elements
      },

      // Font Family
      fontFamily: {
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      },

      // Font Size
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '2rem',        // 32px
        '4xl': '3.5rem'       // 56px - Hero headlines
      },

      // Font Weight
      fontWeight: {
        'normal': 400,        // Regular body text
        'medium': 500,        // Medium emphasis
        'semibold': 600,      // Semibold emphasis
        'extrabold': 800      // Large headlines
      },

      // Line Height
      lineHeight: {
        'tight': 1.2,         // Headlines
        'normal': 1.5,        // Body text
        'relaxed': 1.75       // Spacious content
      },

      // Letter Spacing
      letterSpacing: {
        'tight': '-0.02em',   // Headlines
        'normal': '0',        // Body text
        'wide': '0.05em'      // Labels and mono text
      },

      // Transitions
      transitionDuration: {
        'fast': '150ms',      // Quick micro-interactions
        'base': '200ms',      // Standard transitions
        'slow': '300ms'       // Larger state changes
      },

      // Z-Index
      zIndex: {
        'base': 0,
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070
      },

      // Box Shadow
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      },

      // Responsive Breakpoints (mobile-first)
      screens: {
        'sm': '640px',       // Small devices (large phones)
        'md': '768px',       // Medium devices (tablets)
        'lg': '1024px',      // Large devices (laptops)
        'xl': '1280px'       // Extra large devices (desktops)
      }
    },
  },
  plugins: [],
}

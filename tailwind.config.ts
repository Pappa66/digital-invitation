import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        /* Dashboard/template workspace — dipetakan dari token agar satu sumber. */
        dashboard: {
          bg: 'hsl(var(--background))',
          surface: 'hsl(var(--card))',
          primary: 'hsl(var(--foreground))',
          border: 'hsl(var(--border))'
        },
        /* Brand emas pernikahan (akar: globals.css :root). */
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          strong: 'hsl(var(--gold-strong))',
          deep: 'hsl(var(--gold-deep))',
          ink: 'hsl(var(--gold-ink))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'Great Vibes', 'cursive'],
        body: ['var(--font-body)', 'Jost', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        /* Skala tipografi premium (spasi 8pt konservatif) */
        'display-2xl': ['clamp(3rem, 7vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.5rem, 5vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-lg': ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['1.5rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.45' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.06em' }]
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        gold: 'var(--shadow-gold)',
        dialog: 'var(--shadow-dialog)',
        phone: '0 30px 60px -20px rgba(43,38,32,0.45)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2md': 'var(--radius-md)',
        '3lg': 'var(--radius-lg)',
        '4xl': 'var(--radius-xl)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
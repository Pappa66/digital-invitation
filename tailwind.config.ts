import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#F9FAFB',
          surface: '#FFFFFF',
          primary: '#111827',
          border: '#E5E7EB'
        }
      }
    }
  },
  plugins: []
};

export default config;
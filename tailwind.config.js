/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4',
        secondary: '#8b5cf6',
        danger: '#ef4444',
        success: '#10b981',
        dark: {
          50: '#e2e8f0',
          100: '#cbd5e1',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#111827',
          800: '#0a0e17',
          900: '#020617',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

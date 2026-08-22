/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'bg-teal-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-sky-500',
    'bg-emerald-400',
    'bg-amber-400',
    'text-teal-600',
    'text-amber-600',
    'text-rose-600',
    'bg-teal-100',
    'bg-amber-100',
    'bg-rose-100',
    'border-teal-200',
    'border-amber-200',
    'border-rose-200',
    'text-rose-700',
    'text-sky-700',
    'text-emerald-700',
    'bg-rose-50',
    'bg-sky-50',
    'bg-emerald-50',
    'border-rose-200',
    'border-sky-200',
    'border-emerald-200'
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        background: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        textMain: '#1e293b',
        textMuted: '#64748b',
        teal: '#0d9488',
        tealDark: '#0f766e',
        tealLight: '#ccfbf1',
        safe: '#10b981',
        moderate: '#f59e0b',
        dangerous: '#ef4444',
        dangerousBg: '#fef2f2',
      }
    },
  },
  plugins: [],
}


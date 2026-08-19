/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
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


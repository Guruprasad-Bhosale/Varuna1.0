/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f1f5f9', // slate-100 (soft mist gray)
        surface: '#ffffff',    // pure white cards
        surfaceHover: '#f8fafc', // slate-50
        navy: '#0f172a',       // slate-900 (deep river navy)
        teal: '#0d9488',       // teal-600 (aquatic teal)
        tealLight: '#ccfbf1',  // teal-100
        safe: '#16a34a',       // green-600
        safeBg: '#dcfce7',     // green-100
        moderate: '#d97706',   // amber-600
        moderateBg: '#fef3c7', // amber-100
        dangerous: '#dc2626',  // red-600
        dangerousBg: '#fee2e2',// red-100
        border: '#e2e8f0',     // slate-200
        textMain: '#1e293b',   // slate-800
        textMuted: '#64748b',  // slate-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

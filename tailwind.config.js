/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/lib/config.ts',
    './src/app/lib/helpers.ts'
  ],
  safelist: generateNumberedListClasses(20),
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        success: '#0070f3',
        cyan: '#79FFE1',
        main: '#1e293b',
        'main-dark': '#f8fafc',
        'main-dark-bg': '#282a36',
        'code-dark-bg': '#343e4c',
        'dark-border': '#3b3e54',
        'link-dark': '#ffd479'
      },
      animation: {
        fadeIn: 'fadeIn 500ms;',
        wave: 'wave 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        wave: {
          '0%': { transform: 'rotate(0.0deg) scale(0.4)' },
          '10%': { transform: 'rotate(14deg) scale(0.4)' },
          '20%': { transform: 'rotate(-8deg) scale(0.4)' },
          '30%': { transform: 'rotate(14deg scale(0.4))' },
          '40%': { transform: 'rotate(-4deg scale(0.4))' },
          '50%': { transform: 'rotate(10.0deg) scale(0.4)' },
          '60%': { transform: 'rotate(0.0deg) scale(0.4)' },
          '100%': { transform: 'rotate(0.0deg) scale(0.4)' }
        }
      },
      spacing: {
        28: '7rem'
      },
      letterSpacing: {
        tighter: '-.04em'
      },
      lineHeight: {
        tight: 1.2
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4.5rem',
        '8xl': '6.25rem'
      },
      boxShadow: {
        small: '0 5px 10px rgba(0, 0, 0, 0.12)',
        medium: '0 8px 30px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}

/**
 * Generate for safelist all the classes in the format of before:content-['x.'] or
 * before:content-['x.y.'] or before:content-['x.y.z.']
 */
function generateNumberedListClasses(nbr) {
  const numList = [...Array(nbr).keys()].map(key => `${key + 1}.`)

  const classes = []
  for (const i of numList) {
    classes.push(i)
    for (const j of numList) {
      classes.push(i + j)
      for (const k of numList) {
        classes.push(i + j + k)
      }
    }
  }

  return classes.map(item => `before:content-['${item}']`)
}

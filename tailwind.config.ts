import type { Config } from 'tailwindcss'

export default {
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
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // eslint-disable-next-line quotes
        wave: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 70 500 60' preserveAspectRatio='none'%3E%3Crect x='0' y='0' width='500' height='500' style='stroke: none; fill: %23ffffff;' /%3E%3Cpath d='M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z' style='stroke: none; fill: %23323541;'%3E%3C/path%3E%3C/svg%3E\")"
      },
      colors: {
        success: '#0070f3',
        cyan: '#79FFE1',
        main: '#1e293b'
      },
      animation: {
        fadeIn: 'fadeIn 500ms;',
        wave: 'wave 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' }
        }
      },
      spacing: {
        28: '7rem'
      },
      letterSpacing: {
        tighter: '-.04em'
      },
      lineHeight: {
        tight: '1.2'
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
} satisfies Config

/**
 * Generate for safelist all the classes in the format of before:content-['x.'] or
 * before:content-['x.y.'] or before:content-['x.y.z.']
 */
function generateNumberedListClasses(nbr: number) {
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

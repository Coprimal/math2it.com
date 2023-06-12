import { Comfortaa, Nunito } from 'next/font/google'

// How to use? Comfortaa.className inside className
export const comfortaa = Comfortaa({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['400', '700']
})

export const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic']
})

import 'katex/dist/katex.min.css'
import { Inter } from 'next/font/google'
import 'prismjs/themes/prism-tomorrow.css'
import 'tippy.js/dist/tippy.css'

import Footer from './components/Footer'
import Nav from './components/Nav'
import './globals.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Math2IT',
  description: 'Toán học, Giáo dục và Công nghệ'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Nav />
        <div className="flex min-h-screen flex-col justify-between">{children}</div>
        <Footer />
      </body>
    </html>
  )
}

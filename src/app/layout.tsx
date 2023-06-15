import Footer from '@c/Footer'
import Nav from '@c/nav/Nav'
import '@src/fontello/css/fontello.css'
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'tippy.js/dist/tippy.css'

import './globals.scss'

export const metadata = {
  title: 'Math2IT',
  description: 'Toán học, Giáo dục và Công nghệ'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="flex min-h-screen flex-col justify-between">
          <Nav />
          <div className="mb-auto">
            <main>{children}</main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  )
}

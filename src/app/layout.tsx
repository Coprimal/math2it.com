import Footer from '@c/Footer'
import Nav from '@c/nav/Nav'
import '@src/fontello/css/fontello.css'
import 'katex/dist/katex.min.css'
import Script from 'next/script'
import 'prismjs/themes/prism-tomorrow.css'
import 'tippy.js/dist/tippy.css'

import './globals.scss'

export const revalidate = 60

export const metadata = {
  metadataBase: new URL('https://math2it.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-1MR87DQ1KG" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-1MR87DQ1KG');
        `}
      </Script>
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

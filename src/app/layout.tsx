import Footer from '@c/Footer'
import Nav from '@c/nav/Nav'
import './styles/notion.scss'
import '@src/fontello/css/fontello.css'
import Script from 'next/script'

import './globals.scss'

export const revalidate = 20

export const metadata = {
  metadataBase: new URL('https://math2it.com'),
  robots: {
    index: process.env.ENV_MODE !== 'prod' ? false : true,
    follow: process.env.ENV_MODE !== 'prod' ? false : true,
    nocache: process.env.ENV_MODE !== 'prod' ? true : false,
    googleBot: {
      index: process.env.ENV_MODE !== 'prod' ? false : true,
      follow: process.env.ENV_MODE !== 'prod' ? false : true,
      noimageindex: process.env.ENV_MODE !== 'prod' ? true : false
    }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
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

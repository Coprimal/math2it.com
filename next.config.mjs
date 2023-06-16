import withPlaiceholder from '@plaiceholder/next'

const nextConfig = {
  trailingSlash: true, // use "/about/" instead of "/about" (not supported yet by --turbo)
  poweredByHeader: false, // remove "Powered by Next.js" from the header
  transpilePackages: ['react-syntax-highlighter'],
  experimental: {
    scrollRestoration: true // not supported yet by --turbo
  },
  images: {
    domains: [
      '0.gravatar.com',
      '1.gravatar.com',
      '2.gravatar.com',
      'secure.gravatar.com',
      'math2it.com',
      // 👇 for notion's post cover
      'images.unsplash.com',
      'notion.so',
      'www.notion.so',
      'i.imgur.com',
      's3.us-west-2.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.notion.so'
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/choice/:path*',
        destination: '/tuyen-chon/:path*',
        permanent: true
      },
      {
        source: '/category/:path*',
        destination: '/chuyen-muc/:path*',
        permanent: true
      },
      {
        source: '/tag/:path*',
        destination: '/chu-de/:path*',
        permanent: true
      },
      {
        source: '/all/:path*',
        destination: '/tat-ca-bai-viet/:path*',
        permanent: true
      },
      {
        source: '/author/:path*',
        destination: '/tac-gia/:path*',
        permanent: true
      },
      // for redirect /chuyen-muc/page/* or /category/page/* to /chuyen-muc/trang/*
      {
        source: '/:slug*/page/:path*',
        destination: '/:slug*/trang/:path*',
        permanent: true
      },
      // for categories
      {
        source: '/:slug*/math/:path*',
        destination: '/:slug*/toan-hoc/:path*',
        permanent: true
      },
      {
        source: '/:slug*/translated-articles/:path*',
        destination: '/:slug*/bai-dich/:path*',
        permanent: true
      },
      {
        source: '/:slug*/tool/:path*',
        destination: '/:slug*/cong-cu/:path*',
        permanent: true
      },
      {
        source: '/:slug*/technology/:path*',
        destination: '/:slug*/cong-nghe/:path*',
        permanent: true
      },
      {
        source: '/:slug*/book/:path*',
        destination: '/:slug*/sach-hay/:path*',
        permanent: true
      },
      {
        source: '/:slug*/education/:path*',
        destination: '/:slug*/giao-duc/:path*',
        permanent: true
      },
      {
        source: '/about',
        destination: '/gioi-thieu',
        permanent: true
      },
      {
        source: '/thanks',
        destination: '/cam-on',
        permanent: true
      },
      {
        source: '/privacy',
        destination: '/chinh-sach-bao-mat',
        permanent: true
      }
    ]
  }
}

export default withPlaiceholder(nextConfig)

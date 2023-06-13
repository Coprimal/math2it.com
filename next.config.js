/** @type {import('next').NextConfig} */
const nextConfig = {
  //   trailingSlash: true, // use "/about/" instead of "/about" (not supported yet by --turbo)
  poweredByHeader: false, // remove "Powered by Next.js" from the header
  transpilePackages: ['react-syntax-highlighter'],
  //   experimental: {
  //     scrollRestoration: true // not supported yet by --turbo
  //   }
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
      }
    ]
  }
}

module.exports = nextConfig

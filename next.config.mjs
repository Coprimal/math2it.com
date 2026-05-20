const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  transpilePackages: ['react-syntax-highlighter'],
  staticPageGenerationTimeout: 600,
  experimental: {
    scrollRestoration: true
  },
  headers: async () => {
    const headers = []
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ],
        source: '/:path*'
      })
    }
    return headers
  },
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gravatar.com'
      },
      {
        protocol: 'https',
        hostname: '**.math2it.com'
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com'
      },
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
  }
}

export default nextConfig

const nextConfig = {
  // output: 'export', // Update 25/9/13: use notion-x & auto build on vercel
  trailingSlash: true, // use "/about/" instead of "/about" (not supported yet by --turbo)
  poweredByHeader: false, // remove "Powered by Next.js" from the header
  transpilePackages: ['react-syntax-highlighter'],
  experimental: {
    scrollRestoration: true, // not supported yet by --turbo,
    esmExternals: false
    // 👇 https://nextjs.org/docs/messages/import-esm-externals (error: react-medium-image-zoom)
    // esmExternals: 'loose'
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

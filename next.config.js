/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://rpc.walletconnect.com https://relay.walletconnect.org https://pulse.walletconnect.com https://explorer-api.walletconnect.com https://farcaster.xyz https://client.farcaster.xyz https://*.warpcast.com https://warpcast.com https://*.privy.io https://privy.io https://*.base.org https://base.org https://mainnet.base.org https://*.thegraph.com https://api.studio.thegraph.com",
              "frame-src 'self' https:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
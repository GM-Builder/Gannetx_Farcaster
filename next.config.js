// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://farcaster.xyz https://client.farcaster.xyz https://*.warpcast.com https://*.privy.io https://*.base.org",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "frame-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
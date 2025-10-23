const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' https://*.farcaster.xyz https://farcaster.xyz https://warpcast.com https://client.warpcast.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self' data:;
              frame-src 'self' https://*.farcaster.xyz https://warpcast.com;
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, " ").trim(),
          },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

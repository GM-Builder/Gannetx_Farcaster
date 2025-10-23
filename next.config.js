/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self'
                https://auth.farcaster.xyz
                https://*.farcaster.xyz
                https://farcaster.xyz
                https://client.farcaster.xyz
                https://client.warpcast.com
                https://warpcast.com
                https://*.wrpcd.net
                https://privy.warpcast.com
                https://auth.privy.io
                https://*.rpc.privy.systems
                https://cloudflareinsights.com
                https://explorer-api.walletconnect.com
                https://*.walletconnect.com
                https://*.walletconnect.org
                https://mainnet.base.org
                https://sepolia.base.org
                https://base.llamarpc.com
                https://api.studio.thegraph.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self' data:;
              frame-src 'self' https://*.farcaster.xyz https://farcaster.xyz;
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, " ").trim()
          },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  },
};

module.exports = nextConfig;

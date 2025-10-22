import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://farcaster.xyz https://client.farcaster.xyz https://*.warpcast.com https://*.privy.io https://*.base.org https://api.studio.thegraph.com" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
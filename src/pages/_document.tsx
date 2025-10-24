import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload Farcaster MiniApp SDK to reduce first-load delays inside the frame */}
        <link rel="modulepreload" href="https://esm.sh/@farcaster/miniapp-sdk" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
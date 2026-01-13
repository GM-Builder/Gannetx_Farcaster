import type { AppProps } from "next/app"
import Head from "next/head"
import "@/styles/globals.css"
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { FarcasterProvider } from '@/hooks/useFarcasterContext'
import FarcasterMiniAppProvider from '@/components/providers/FarcasterMiniAppProvider'
import { SuccessAnimationProvider } from '@/components/SuccessAnimationContext'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'viem/chains'
// styles are now imported in globals.css to fix Vercel build error
// import '@coinbase/onchainkit/styles.css'
// sdk is loaded inside FarcasterMiniAppProvider

function FarcasterApp({ Component, pageProps }: AppProps) {
  // Keep app rendering non-blocking. The FarcasterMiniAppProvider will initialise the SDK
  // in the background and won't block rendering.

  return (
    <>
      <Head>
        <title>GannetX Farcaster</title>
        <meta name="description" content="GannetX on Farcaster" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Initialize miniapp SDK in background without blocking rendering */}
      <FarcasterMiniAppProvider>
        <FarcasterProvider>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{
              appearance: {
                mode: 'dark',
                theme: 'base',
              },
            }}
            miniKit={{ enabled: true }}
          >
            <SuccessAnimationProvider>
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  className: 'custom-toast',
                  style: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#1f2937',
                    backdropFilter: 'blur(8px)',
                  },
                  duration: 5000,
                }}
              />

              <main suppressHydrationWarning>
                <Component {...pageProps} />
              </main>
            </SuccessAnimationProvider>
          </OnchainKitProvider>
        </FarcasterProvider>
      </FarcasterMiniAppProvider>
    </>
  )
}

export default FarcasterApp
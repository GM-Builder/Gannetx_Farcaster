import type { AppProps } from "next/app"
import Head from "next/head"
import "@/styles/globals.css"
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { FarcasterProvider } from '@/hooks/useFarcasterContext'
import { sdk } from '@farcaster/miniapp-sdk'

function FarcasterApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Check if running in Farcaster environment
    const isFarcasterFrame = typeof window !== 'undefined' && 
      (window.location.search.includes('miniApp=true') || 
       window.location.pathname.includes('/farcaster'));

    if (isFarcasterFrame) {
      console.log('🎯 Initializing Farcaster SDK...');
      
      sdk.actions.ready()
        .then(() => {
          console.log('✅ SDK ready!');
          console.log('📱 Context:', sdk.context);
          setSdkReady(true);
        })
        .catch(err => {
          console.error('❌ Failed to initialize SDK:', err);
          setError(err.message || 'Failed to initialize SDK');
          // Still set ready to true to allow app to load
          setSdkReady(true);
        });
    } else {
      console.log('ℹ️ Not in Farcaster frame, skipping SDK init');
      setSdkReady(true);
    }
  }, [])

  if (!mounted || !sdkReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing Farcaster...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2 max-w-md mx-auto">{error}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>GannetX Farcaster</title>
        <meta name="description" content="GannetX on Farcaster" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FarcasterProvider>
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
      </FarcasterProvider>
    </>
  )
}

export default FarcasterApp
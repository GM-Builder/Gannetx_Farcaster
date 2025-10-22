import type { AppProps } from "next/app"
import Head from "next/head"
import "@/styles/globals.css"
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { FarcasterProvider } from '@/hooks/useFarcasterContext'
import { SuccessAnimationProvider } from '@/components/SuccessAnimationContext' // Tambahkan import ini
import { ErrorBoundary } from 'react-error-boundary'

// Error Fallback Component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
        <pre className="text-sm text-left bg-white p-4 rounded overflow-auto">
          {error.message}
        </pre>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

function FarcasterApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initApp = async () => {
      setMounted(true)

      // Check if running in Farcaster environment
      const isFarcasterFrame = typeof window !== 'undefined' && 
        (window.location.search.includes('miniApp=true') || 
         window.location.pathname.includes('/farcaster') ||
         window.parent !== window);

      if (isFarcasterFrame) {
        try {
          console.log('🎯 Initializing Farcaster SDK...');
          
          const { sdk } = await import('@farcaster/miniapp-sdk');
          
          const context = await sdk.context;
          console.log('📱 Context received:', context);
          
          await sdk.actions.ready();
          console.log('✅ SDK ready called successfully!');
          
          setSdkReady(true);
        } catch (err: any) {
          console.error('❌ Failed to initialize SDK:', err);
          setError(err?.message || 'Failed to initialize SDK');
          setSdkReady(true);
        }
      } else {
        console.log('ℹ️ Not in Farcaster frame, skipping SDK init');
        setSdkReady(true);
      }
    };

    initApp();
  }, [])

  if (!mounted || !sdkReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing Farcaster...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2 max-w-md mx-auto px-4">{error}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Head>
        <title>GannetX Farcaster</title>
        <meta name="description" content="GannetX on Farcaster" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FarcasterProvider>
        <SuccessAnimationProvider> {/* Tambahkan provider ini */}
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
        </SuccessAnimationProvider> {/* Tutup provider ini */}
      </FarcasterProvider>
    </ErrorBoundary>
  )
}

export default FarcasterApp
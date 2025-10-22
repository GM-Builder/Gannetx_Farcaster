import type { AppProps } from "next/app"
import Head from "next/head"
import "@/styles/globals.css"
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { FarcasterProvider } from '@/hooks/useFarcasterContext'
import { SuccessAnimationProvider } from '@/components/SuccessAnimationContext'

function FarcasterApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initApp = async () => {
      setMounted(true);

      if (typeof window === 'undefined') {
        setSdkReady(true);
        return;
      }

      const isFarcasterFrame = 
        window.location.search.includes('miniApp=true') || 
        window.location.pathname.includes('/farcaster') ||
        window.parent !== window;

      console.log('🔍 Environment check:', {
        search: window.location.search,
        pathname: window.location.pathname,
        isFrame: window.parent !== window,
        isFarcasterFrame
      });

      if (!isFarcasterFrame) {
        console.log('ℹ️ Not in Farcaster frame, skipping SDK init');
        setSdkReady(true);
        return;
      }

      try {
        console.log('🎯 [Step 1/3] Loading Farcaster SDK...');
        const { default: sdk } = await import('@farcaster/miniapp-sdk');
        
        console.log('🎯 [Step 2/3] Getting SDK context...');
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Context timeout')), 10000)
          )
        ]);
        console.log('✅ Context received:', context);

        console.log('🎯 [Step 3/3] Calling sdk.actions.ready()...');
        await sdk.actions.ready();
        console.log('✅ SDK ready() completed!');
        
        setSdkReady(true);
      } catch (err: any) {
        console.error('❌ SDK initialization failed:', err);
        setError(err?.message || 'Failed to initialize Farcaster SDK');
        setSdkReady(true);
      }
    };

    const timer = setTimeout(initApp, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !sdkReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
        <div className="text-center">
          <img src="/logo.png" alt="GannetX" className="h-20 w-auto mx-auto mb-6" />
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {error || 'Initializing Farcaster...'}
          </p>
          {error && (
            <p className="text-xs text-red-500 mt-2 max-w-md mx-auto">
              {error}
            </p>
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
      </FarcasterProvider>
    </>
  )
}

export default FarcasterApp
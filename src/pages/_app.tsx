import type { AppProps } from "next/app"
import Head from "next/head"
import "@/styles/globals.css"
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { FarcasterProvider } from '@/hooks/useFarcasterContext'
import { SuccessAnimationProvider } from '@/components/SuccessAnimationContext'
import sdk from '@farcaster/miniapp-sdk';

function FarcasterApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simpler, non-blocking initialization pattern:
    // - mark mounted immediately so UI can render
    // - only wait briefly for sdk.actions.ready and provider; don't block on QuickAuth
    const initApp = async () => {
      setMounted(true);

      if (typeof window === 'undefined') {
        setSdkReady(true);
        return;
      }

      const isFarcasterFrame =
        window.location.search.includes('frame=true') ||
        window.location.pathname.includes('/farcaster') ||
        window.parent !== window;

      console.log('🔍 Environment check:', { isFarcasterFrame, pathname: window.location.pathname, userAgent: navigator.userAgent });

      if (!isFarcasterFrame) {
        setSdkReady(true);
        return;
      }

      try {
        // Wait briefly for sdk.actions.ready()
        try {
          await Promise.race([
            sdk.actions.ready(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sdk.actions.ready() timeout after 5s')), 5000))
          ]);
          console.log('✅ sdk.actions.ready() completed');
        } catch (readyErr) {
          console.warn('⚠️ sdk.actions.ready() did not complete quickly:', readyErr);
        }

        // Try to get provider but don't block app render if it takes time
        try {
          const ethProvider = await Promise.race([
            sdk.wallet.ethProvider,
            new Promise((_, reject) => setTimeout(() => reject(new Error('ethProvider timeout after 3s')), 3000))
          ]);

          if (ethProvider) {
            try {
              (window as any).ethereum = ethProvider;
              try { (window as any).ethereum.isFarcaster = true; } catch(e) {}
              (window as any).farcasterEthereum = ethProvider;
              console.log('✅ Injected Farcaster provider to window.ethereum');
            } catch (injectErr) {
              console.warn('⚠️ Failed to inject Farcaster provider:', injectErr);
            }
          }
        } catch (provErr) {
          console.warn('⚠️ ethProvider not available quickly:', provErr);
        }

        // Kick off QuickAuth in background (do not await) to avoid blocking splash
        (async () => {
          try {
            const quickAuthPromise = sdk.quickAuth?.getToken?.();
            if (quickAuthPromise) {
              const { token } = await Promise.race([
                quickAuthPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('quickAuth timeout after 4s')), 4000))
              ] as any);
              console.log('✅ QuickAuth token (background):', typeof token === 'string' ? 'ok' : token);
            }
          } catch (qaErr) {
            console.warn('⚠️ QuickAuth background attempt failed:', qaErr);
          }
        })();

        // Allow UI to continue immediately
        setSdkReady(true);
      } catch (err: any) {
        console.error('❌ SDK initialization unexpected error:', err);
        setError(err?.message || 'Failed to initialize Farcaster SDK');
        setSdkReady(true);
      }
    };

    // Start init immediately (no long delay)
    const timer = setTimeout(initApp, 0);

    // Safety timeout: if SDK init doesn't finish in X ms, ensure app continues
    const safetyTimer = setTimeout(() => {
      console.warn('⏱️ Farcaster SDK init safety timeout reached — continuing without blocking UI');
      setSdkReady(true);
      setError((prev) => prev ?? 'Farcaster SDK init timed out');
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);


  if (!mounted || !sdkReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
        <div className="text-center px-4">
          <img 
            src="/logo.png" 
            alt="GannetX" 
            className="h-20 w-auto mx-auto mb-6 animate-pulse" 
          />
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {error ? 'Initialization error, loading anyway...' : 'Initializing Farcaster...'}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md mx-auto">
              <p className="text-xs text-red-500 dark:text-red-400">
                {error}
              </p>
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
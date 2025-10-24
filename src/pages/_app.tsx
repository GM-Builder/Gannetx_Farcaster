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

      console.log('🔍 Environment check:', {
        search: window.location.search,
        pathname: window.location.pathname,
        isFrame: window.parent !== window,
        isFarcasterFrame,
        userAgent: navigator.userAgent
      });

      if (!isFarcasterFrame) {
        console.log('ℹ️ Not in Farcaster frame, skipping SDK init');
        setSdkReady(true);
        return;
      }

      try {
        console.log('🎯 [Step 1/5] Waiting for SDK availability...');
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('🎯 [Step 2/5] Getting SDK context...');
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Context timeout after 10s')), 10000)
          )
        ]) as any;

        console.log('✅ Context received:', {
          user: context?.user,
          location: context?.location
        });

        console.log('🎯 [Step 3/5] Calling sdk.actions.ready()...');
        // don't block forever if ready() hangs in some embedded environments
        await Promise.race([
          sdk.actions.ready(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('sdk.actions.ready() timeout after 8s')), 8000))
        ]);
        console.log('✅ SDK ready() completed!');

        console.log('🎯 [Step 4/5] Getting wallet provider...');
        try {
          // also don't block indefinitely getting the provider
          const ethProvider = await Promise.race([
            sdk.wallet.ethProvider,
            new Promise((_, reject) => setTimeout(() => reject(new Error('ethProvider timeout after 5s')), 5000))
          ]);

          if (ethProvider) {
            console.log('✅ Farcaster wallet provider available');

            // If we're running inside the Farcaster frame, prefer the built-in Farcaster
            // wallet provider *always* so we avoid falling back to external wallets.
            try {
              (window as any).ethereum = ethProvider;
              // mark provider so callers can detect it and avoid calling wallet_switchEthereumChain
              try { (window as any).ethereum.isFarcaster = true; } catch(e) { /* ignore */ }
              // also expose on a dedicated property for anyone who wants the original SDK provider
              (window as any).farcasterEthereum = ethProvider;
              console.log('✅ Injected Farcaster provider to window.ethereum (overrode external provider if present)');
            } catch (injectErr) {
              console.warn('⚠️ Failed to inject Farcaster provider to window.ethereum, will continue without override', injectErr);
            }

            // Request wallet access (best-effort)
            try {
              const providerAny = ethProvider as any;
              const accounts = await providerAny.request({ method: 'eth_requestAccounts' });
              console.log('✅ Accounts authorized:', accounts);
            } catch (accountError) {
              console.warn('⚠️ Could not request accounts:', accountError);
            }
          } else {
            console.warn('⚠️ No wallet provider from SDK');
          }
        } catch (walletError) {
          console.warn('⚠️ Failed to get wallet provider:', walletError);
        }

        console.log('🎯 [Step 5/5] Performing Safe QuickAuth...');
          try {
            // 1️⃣ Coba QuickAuth biasa dulu
            const { token } = await sdk.quickAuth.getToken();
            console.log('✅ QuickAuth token received:', token);
          } catch (authError) {
            console.warn('⚠️ Direct QuickAuth failed, trying proxy fallback:', authError);

            try {
              // 2️⃣ Fallback ke proxy
              const res = await fetch('/api/farcaster-auth');
              if (!res.ok) throw new Error(`Proxy failed: ${res.statusText}`);

              const nonceData = await res.json();
              console.log('✅ Got nonce via proxy:', nonceData);
            } catch (proxyError) {
              console.error('❌ Both QuickAuth and proxy failed:', proxyError);
            }
          }

          // Jangan hentikan render walau QuickAuth gagal
          setSdkReady(true);
          console.log('✅ Farcaster SDK fully initialized (with or without QuickAuth)');



        // Small delay to let everything settle
        await new Promise(resolve => setTimeout(resolve, 500));

        setSdkReady(true);
        console.log('✅ Farcaster SDK fully initialized with QuickAuth!');
      } catch (err: any) {
        console.error('❌ SDK initialization failed:', err);
        setError(err?.message || 'Failed to initialize Farcaster SDK');
        setSdkReady(true);
      }
    };

    // Delay to ensure frame fully loaded
    const timer = setTimeout(initApp, 500);

    // Safety timeout: if SDK init doesn't finish in X ms, stop blocking the app
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
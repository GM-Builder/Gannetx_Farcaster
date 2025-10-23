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
        window.location.search.includes('miniApp=true') ||
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
        await sdk.actions.ready();
        console.log('✅ SDK ready() completed!');

        console.log('🎯 [Step 4/5] Getting wallet provider...');
        try {
          const ethProvider = await sdk.wallet.ethProvider;

          if (ethProvider) {
            console.log('✅ Farcaster wallet provider available');

            // Inject to window if not present
            if (!window.ethereum) {
              (window as any).ethereum = ethProvider;
              console.log('✅ Injected Farcaster provider to window.ethereum');
            }

            // Request wallet access
            try {
              const accounts = await ethProvider.request({
                method: 'eth_requestAccounts'
              });
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

        console.log('🎯 [Step 5/5] Performing QuickAuth...');
        try {
          const { token } = await sdk.quickAuth.getToken();
          console.log('✅ QuickAuth token received:', token);

          // OPTIONAL: Fetch user info from your backend
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
          if (backendUrl) {
            const res = await fetch(`${backendUrl}/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const userData = await res.json();
              console.log('✅ Authenticated user from backend:', userData);
            } else {
              console.warn('⚠️ Failed to fetch user info, status:', res.status);
            }
          } else {
            // No backend? just decode the token locally to read FID
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🧩 Decoded QuickAuth payload:', payload);
          }
        } catch (authError) {
          console.warn('⚠️ QuickAuth failed or skipped:', authError);
        }

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
    return () => clearTimeout(timer);
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
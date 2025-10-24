'use client'
import { useEffect, useState } from 'react'

export default function FarcasterMiniAppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        console.log('🚀 [MiniApp] Initializing...')
        
        // Import SDK sesuai docs
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        console.log('📦 [MiniApp] SDK imported')
        
        // CRITICAL: Wait for app to be fully loaded
        // Docs says: "After your app is fully loaded and ready to display"
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('📢 [MiniApp] Calling sdk.actions.ready()...')

        // Call ready() - note: docs show it CAN be awaited
        await sdk.actions.ready()

        console.log('✅ [MiniApp] Ready called successfully!')

        // Try to obtain the injected wallet provider from the SDK and expose it as window.ethereum
        try {
          const ethProvider = await Promise.race([
            sdk.wallet.ethProvider,
            new Promise((_, reject) => setTimeout(() => reject(new Error('ethProvider timeout after 2s')), 2000))
          ] as any);

          if (ethProvider) {
            try {
              (window as any).ethereum = ethProvider;
              try { (window as any).ethereum.isFarcaster = true; } catch(e) {}
              (window as any).farcasterEthereum = ethProvider;
              console.log('🔌 [MiniApp] Injected Farcaster provider to window.ethereum');
            } catch (injectErr) {
              console.warn('⚠️ [MiniApp] Failed to inject Farcaster provider:', injectErr);
            }
          } else {
            console.warn('⚠️ [MiniApp] No ethProvider returned from SDK');
          }
        } catch (ethErr) {
          console.warn('⚠️ [MiniApp] ethProvider not available quickly:', ethErr);
        }

        setIsReady(true)
      } catch (err) {
        console.error('❌ [MiniApp] Error:', err)
        // Even on error, set ready to prevent infinite loading
        setIsReady(true)
      }
    }

    initMiniApp()
  }, [])

  // Don't block rendering, provider is transparent
  return <>{children}</>
}

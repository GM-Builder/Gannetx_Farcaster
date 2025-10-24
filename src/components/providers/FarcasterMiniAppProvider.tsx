'use client'
import React, { useEffect, useState, createContext, useContext } from 'react'

type MiniAppContextType = {
  isReady: boolean;
  supportedChains: string[];
  capabilities: string[];
  supportsChain: (caip2: string) => boolean;
  supportsCapability: (cap: string) => boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isReady: false,
  supportedChains: [],
  capabilities: [],
  supportsChain: () => false,
  supportsCapability: () => false,
});

export const useFarcasterMiniApp = () => useContext(MiniAppContext);

export default function FarcasterMiniAppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [supportedChains, setSupportedChains] = useState<string[]>([])
  const [capabilities, setCapabilities] = useState<string[]>([])

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        console.log('🚀 [MiniApp] Initializing...')

        // Import SDK sesuai docs
        const { sdk } = await import('@farcaster/miniapp-sdk')

        console.log('📦 [MiniApp] SDK imported')

        // CRITICAL: Wait for app to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('📢 [MiniApp] Calling sdk.actions.ready()...')

        // Call ready() - note: docs show it CAN be awaited
        await sdk.actions.ready()

        console.log('✅ [MiniApp] Ready called successfully!')

        // Detect supported chains & capabilities (runtime detection)
        try {
          const chains = (await Promise.race([
            sdk.getChains(),
            new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getChains timeout after 2s')), 2000))
          ])) as string[];
          const caps = (await Promise.race([
            sdk.getCapabilities(),
            new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getCapabilities timeout after 2s')), 2000))
          ])) as string[];

          setSupportedChains(Array.isArray(chains) ? chains : []);
          setCapabilities(Array.isArray(caps) ? caps : []);

          // also attach to window for easier debugging
          try {
            (window as any).farcasterSupportedChains = chains;
            (window as any).farcasterCapabilities = caps;
          } catch (e) {}

          console.log('🔎 [MiniApp] supportedChains:', chains);
          console.log('🔎 [MiniApp] capabilities:', caps);
        } catch (detErr) {
          console.warn('⚠️ [MiniApp] Could not detect chains/capabilities:', detErr);
        }

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

  const value = {
    isReady,
    supportedChains,
    capabilities,
    supportsChain: (caip2: string) => supportedChains.includes(caip2),
    supportsCapability: (cap: string) => capabilities.includes(cap),
  } as MiniAppContextType;

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  )
}

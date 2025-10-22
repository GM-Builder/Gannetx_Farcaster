import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
}

interface FarcasterContextType {
  user: FarcasterUser | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  user: null,
  isLoading: true,
  isReady: false,
  error: null,
});

export const useFarcasterUser = () => useContext(FarcasterContext);

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider: React.FC<FarcasterProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        console.log('🎯 Getting Farcaster context...');
        
        const context = await sdk.context;
        console.log('✅ Got context:', context);
        
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username || null,
            displayName: context.user.displayName || null,
            pfpUrl: context.user.pfpUrl || null,
          });
        }

        setIsReady(true);
        console.log('✅ Farcaster initialization complete');
        
      } catch (err) {
        console.error('❌ Farcaster initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFarcaster();
  }, []);

  return (
    <FarcasterContext.Provider value={{ user, isLoading, isReady, error }}>
      {children}
    </FarcasterContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export const useFarcasterUser = () => {
  const context = useContext(FarcasterContext);
  return context;
};

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
      if (typeof window === 'undefined') {
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🎯 FarcasterProvider: Getting context...');
        
  const { default: sdk } = await import('@farcaster/miniapp-sdk');
        
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Context timeout in provider')), 8000)
          )
        ]);
        
        console.log('✅ FarcasterProvider: Got context:', context);
        
        if (context && typeof context === 'object' && 'user' in context) {
          const contextUser = (context as any).user;
          if (contextUser) {
            setUser({
              fid: contextUser.fid,
              username: contextUser.username || null,
              displayName: contextUser.displayName || null,
              pfpUrl: contextUser.pfpUrl || null,
            });
          }
        }

        setIsReady(true);
        console.log('✅ FarcasterProvider ready');
        
      } catch (err) {
        console.error('❌ FarcasterProvider initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeFarcaster, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FarcasterContext.Provider value={{ user, isLoading, isReady, error }}>
      {children}
    </FarcasterContext.Provider>
  );
};
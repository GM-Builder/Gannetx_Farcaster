// src/types/global.d.ts

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      send?: unknown;
      sendAsync?: unknown;
    };
    
    // Farcaster SDK
    fc?: {
      context?: {
        user?: {
          fid: number;
          username: string;
          displayName: string;
          pfpUrl: string;
        };
      };
    };
  }
}

// Augment module declarations
declare module '@farcaster/frame-sdk' {
  export interface FrameContext {
    user?: {
      fid: number;
      username: string;
      displayName: string;
      pfpUrl: string;
      custody?: string;
      verifications?: string[];
    };
    location?: {
      type: 'cast' | 'direct_cast' | 'channel';
      castId?: {
        fid: number;
        hash: string;
      };
      channelKey?: string;
    };
  }
}

// Viem chain types
declare module 'viem/chains' {
  export interface Chain {
    id: number;
    name: string;
    network: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: {
      default: { http: string[] };
      public: { http: string[] };
    };
    blockExplorers?: {
      default: { name: string; url: string };
    };
  }
}

// Environment variables type safety
declare namespace NodeJS {
  interface ProcessEnv {
    // Base URLs
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_FARCASTER_FRAME_URL: string;
    
    // API Keys
    NEXT_PUBLIC_COINBASE_API_KEY: string;
    NEXT_PUBLIC_ALCHEMY_KEY: string;
    NEXT_PUBLIC_INFURA_KEY: string;
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
    
    // Contract Addresses
    NEXT_PUBLIC_CONTRACT_ADDRESS: string;
    BASE_MAINNET_CONTRACT_ADDRESS: string;
    SONEIUM_MAINNET_CONTRACT_ADDRESS: string;
    INK_MAINNET_CONTRACT_ADDRESS: string;
    REFERRAL_CONTRACT_ADDRESS: string;
    
    // Chain Configuration
    NEXT_PUBLIC_TEA_SEPOLIA_CHAIN_ID: string;
    NEXT_PUBLIC_CHECKIN_FEE: string;
    NEXT_PUBLIC_DEPLOY_BLOCK: string;
    
    // RPC URLs
    NEXT_PUBLIC_BASE_MAINNET_RPC_URL: string;
    NEXT_PUBLIC_INK_MAINNET_RPC_URL: string;
    NEXT_PUBLIC_SONEIUM_MAINNET_RPC_URL: string;
    
    // Subgraph URLs
    NEXT_PUBLIC_REFERRAL_SUBGRAPH_URL: string;
    
    // Analytics
    NEXT_PUBLIC_GA_ID: string;
  }
}

export {};
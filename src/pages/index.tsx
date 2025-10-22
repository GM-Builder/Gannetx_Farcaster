import React, { useState, useCallback, useEffect } from 'react';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wagmi';
import { useFarcasterUser } from '@/hooks/useFarcasterContext';
import { sdk } from '@farcaster/miniapp-sdk';
import { ethers } from 'ethers';
import { FaUser, FaWallet } from 'react-icons/fa';
import toast from 'react-hot-toast';

const queryClient = new QueryClient();

const FarcasterContent = () => {
  const { user, isLoading: userLoading, isReady } = useFarcasterUser();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
    if (isReady && !isConnected && !isConnecting && farcasterConnector) {
      console.log('🔌 Auto-connecting...');
      connect({ connector: farcasterConnector });
    }
  }, [isReady, isConnected, isConnecting, connect, connectors]);

  useEffect(() => {
    const initProvider = async () => {
      if (isConnected) {
        try {
          const ethProvider = await sdk.wallet.ethProvider;
          const web3Provider = new ethers.providers.Web3Provider(ethProvider as any);
          const web3Signer = web3Provider.getSigner();
          
          setProvider(web3Provider);
          setSigner(web3Signer);
          console.log('✅ Provider ready!');
        } catch (err) {
          console.error('❌ Failed to get provider:', err);
        }
      }
    };

    initProvider();
  }, [isConnected]);

  if (userLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">GannetX Farcaster</h1>
          
          {isConnected && address ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Chain ID: {chainId}
                </p>
              </div>

              {user && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {user.pfpUrl ? (
                      <img src={user.pfpUrl} alt="PFP" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                        <FaUser className="text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{user.displayName || user.username}</p>
                      <p className="text-sm text-gray-600">@{user.username} • FID: {user.fid}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => disconnect()}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center">
              <FaWallet className="text-6xl text-cyan-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Connect your Farcaster wallet</p>
              <button
                onClick={() => {
                  const fc = connectors.find(c => c.id === 'farcasterMiniApp');
                  if (fc) connect({ connector: fc });
                }}
                className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FarcasterContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
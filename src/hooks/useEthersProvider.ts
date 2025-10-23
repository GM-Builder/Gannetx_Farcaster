// src/hooks/useEthersProvider.ts
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

export function useDirectProvider() {
  const { isConnected, address } = useAccount();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      if (!isConnected || !address) {
        setProvider(null);
        setSigner(null);
        setError(null);
        return;
      }

      if (typeof window === 'undefined' || !window.ethereum) {
        setError('No ethereum provider found');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔌 Creating Web3Provider from window.ethereum...');
        const web3Provider = new ethers.providers.Web3Provider(
          window.ethereum as any,
          'any'
        );

        console.log('🔐 Getting signer for address:', address);
        // Pass address explicitly to avoid getAddress() call
        const web3Signer = web3Provider.getSigner(address);

        setProvider(web3Provider);
        setSigner(web3Signer);
        console.log('✅ Provider and signer ready!');
      } catch (err: any) {
        console.error('❌ Failed to create provider:', err);
        setError(err.message || 'Failed to create provider');
        setProvider(null);
        setSigner(null);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure window.ethereum is ready
    const timer = setTimeout(initProvider, 500);
    return () => clearTimeout(timer);
  }, [isConnected, address]);

  return { provider, signer, loading, error };
}
// src/hooks/useDirectProvider.ts
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

export function useDirectProvider() {
  const { isConnected } = useAccount();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    if (isConnected && typeof window !== 'undefined' && window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const web3Signer = web3Provider.getSigner();
        
        setProvider(web3Provider);
        setSigner(web3Signer);
        console.log('✅ Direct provider and signer ready');
      } catch (err) {
        console.error('❌ Failed to create provider:', err);
      }
    } else {
      setProvider(null);
      setSigner(null);
    }
  }, [isConnected]);

  return { provider, signer };
}
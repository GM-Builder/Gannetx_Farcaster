import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSpinner, FaCheckCircle, FaClock, FaWallet, 
  FaStar, FaRegStar, FaFilter,
  FaMoon,
  FaLayerGroup,
  FaGlobe,
  FaFlask,
} from 'react-icons/fa';
import { 
  SUPPORTED_CHAINS, 
  getSupportedChainIds,
  getContractAddress,
  getChainRpcUrl,
  getChainAbi,
  BASE_CHAIN_ID,
} from '@/utils/constants';
import { 
  performCheckin, 
  switchToChain, 
  getContract, 
  getProvider,
  delay
} from '@/utils/web3';
import { ethers } from 'ethers';
import ChainLogo from '@/components/ChainLogo';
import toast from 'react-hot-toast';
import SuccessAnimation from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/components/SuccessAnimationContext';
import { useUserStats } from '@/hooks/useSubgraph';
import sdk from '@farcaster/miniapp-sdk';
import { useFarcasterMiniApp } from '@/components/providers/FarcasterMiniAppProvider';


type NetworkType = 'all' | 'mainnet' | 'testnet';
type FilterType = 'all' | 'available' | 'checked' | 'favorites';
type SortOptionType = 'name' | 'status';

interface ChainCheckinStatus {
  canCheckin: boolean;
  lastCheckin: number | null;
  timeUntilNextCheckin: number;
}

interface Chain {
  id: number;
  chainName: string;
  logoUrl: string;
  status: ChainCheckinStatus;
  chainId: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  contractAddress?: string;
  [key: string]: any; 
}

interface MultiChainCheckinGridProps {
  isConnected: boolean;
  currentChainId?: number | null;
  address?: string | null;
  signer?: ethers.Signer | null;
  provider?: ethers.providers.Web3Provider | null;
  onCheckinSuccess?: (chainId: number, txHash: string) => void;
  networkType?: NetworkType;
  triggerAnimation?: { chainId: number; chainName: string } | null;
  onAnimationComplete?: () => void;
}

const SORT_OPTIONS: { value: SortOptionType; label: string }[] = [
  { value: 'name', label: 'Sort by Name' },
  { value: 'status', label: 'Sort by Status' },
];

const MultiChainCheckinGrid: React.FC<MultiChainCheckinGridProps> = ({
  isConnected,
  currentChainId,
  address,
  signer,
  provider,
  onCheckinSuccess,
  networkType = 'all',
  triggerAnimation,
  onAnimationComplete,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingChainId, setProcessingChainId] = useState<number | null>(null);
  const [successChainId, setSuccessChainId] = useState<number | null>(null);
  const [favoriteChains, setFavoriteChains] = useState<number[]>([]);
  const [chainStatusMap, setChainStatusMap] = useState<Record<number, ChainCheckinStatus>>({});
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOptionType>('name');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [networkSwitchingChainId, setNetworkSwitchingChainId] = useState<number | null>(null);
  const [successAnimationData, setSuccessAnimationData] = useState<{
  visible: boolean;
  chainId: number | null;
  chainName: string;
}>({
  visible: false,
  chainId: null,
  chainName: '',
});

const SORT_OPTIONS: { value: SortOptionType; label: string }[] = [
  { value: 'name', label: 'Sort by Name' },
  { value: 'status', label: 'Sort by Status' },
];
  
  const { soundEnabled } = useSuccessAnimation();
  const { data: userStats } = useUserStats(address || undefined);
  const miniApp = useFarcasterMiniApp();
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };

    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (triggerAnimation) {
      setSuccessAnimationData({
        visible: true,
        chainId: triggerAnimation.chainId,
        chainName: triggerAnimation.chainName,
      });
    }
  }, [triggerAnimation]);


  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteChains');
      if (savedFavorites) {
        setFavoriteChains(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error('Error parsing favorite chains', e);
      setFavoriteChains([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteChains', JSON.stringify(favoriteChains));
  }, [favoriteChains]);

  useEffect(() => {
    if (successChainId) {
      const timer = setTimeout(() => setSuccessChainId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successChainId]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setChainStatusMap(prevMap => {
        const newMap = { ...prevMap };
        let updated = false;

        Object.keys(newMap).forEach(chainIdStr => {
          const chainId = parseInt(chainIdStr);
          const status = newMap[chainId];
          
          if (status.timeUntilNextCheckin > 0) {
            newMap[chainId] = {
              ...status,
              timeUntilNextCheckin: status.timeUntilNextCheckin - 1
            };
            
            if (newMap[chainId].timeUntilNextCheckin === 0) {
              newMap[chainId].canCheckin = true;
              updated = true;
            }
          }
        });

        return updated ? newMap : prevMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && address && signer) {
      checkAllChainsStatus();
    } else {
      setChainStatusMap({});
    }
  }, [isConnected, address, signer]);

  const toggleFavorite = useCallback((chainId: number): void => {
    setFavoriteChains(prev => {
      if (prev.includes(chainId)) {
        return prev.filter(id => id !== chainId);
      } else {
        return [...prev, chainId];
      }
    });
  }, []);

  const checkAllChainsStatus = async (): Promise<void> => {
    if (!isConnected || !signer || !address) {
      console.log("Not connected or missing signer/address");
      return;
    }

    setIsLoading(true);
    const supportedChainIds = getSupportedChainIds();
    const statusMap: Record<number, ChainCheckinStatus> = {};

    try {
      supportedChainIds.forEach(chainId => {
        statusMap[chainId] = {
          canCheckin: true,
          lastCheckin: null,
          timeUntilNextCheckin: 0
        };
      });
      
      setChainStatusMap(statusMap);

      const BATCH_SIZE = 3;
      const DELAY_BETWEEN_REQUESTS = 500; 
      
      for (let i = 0; i < supportedChainIds.length; i += BATCH_SIZE) {
        const batchChainIds = supportedChainIds.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batchChainIds.map(async (chainId) => {
          try {
            await delay(Math.random() * 200);
            
            const contractAddress = getContractAddress(chainId);
            const abi = getChainAbi(chainId);
            if (!abi) {
              console.warn(`ABI not found for chain ${chainId}`);
              return { chainId, status: statusMap[chainId] };
            }
            
            // Use server-side endpoint to avoid CORS issues with public RPC nodes
            try {
              const resp = await fetch('/api/chain-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chainId, address })
              });

              if (!resp.ok) {
                console.warn(`Server chain-status error for ${chainId}: ${resp.status}`);
                return { chainId, status: statusMap[chainId] };
              }

              const data = await resp.json();
              if (data && data.status) {
                return { chainId, status: data.status };
              }

              return { chainId, status: statusMap[chainId] };
            } catch (err) {
              console.error(`Error fetching chain status from server for ${chainId}:`, err);
              return { chainId, status: statusMap[chainId] };
            }
          } catch (error) {
            console.error(`Error checking status for chain ${chainId}:`, error);
            return { chainId, status: statusMap[chainId] };
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            statusMap[result.value.chainId] = result.value.status;
          }
        });
        
        setChainStatusMap({...statusMap});
        
        if (i + BATCH_SIZE < supportedChainIds.length) {
          await delay(DELAY_BETWEEN_REQUESTS);
        }
      }
    } catch (error) {
      console.error("Error checking chain statuses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async (chainId: number): Promise<void> => {
    if (processingChainId !== null) return;

    try {
      setProcessingChainId(chainId);
      console.log(`🚀 Starting checkin on chain ${chainId}`);

      // ✅ Ambil provider dari window.ethereum (sudah diinject dari _app.tsx)
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      if (!provider) throw new Error("Ethereum provider not found.");

      // ✅ Ambil wallet address dari QuickAuth, bukan eth_accounts
      console.log("🎯 Requesting QuickAuth token...");
      const { token } = await sdk.quickAuth.getToken();

      // Decode JWT payload (untuk baca FID)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("✅ QuickAuth token payload:", payload);

      // Gunakan API Farcaster untuk ambil primary address Ethereum
      const res = await fetch(
        `https://api.farcaster.xyz/fc/primary-address?fid=${payload.sub}&protocol=ethereum`
      );
      if (!res.ok) throw new Error("Failed to resolve primary address from Farcaster API");

      const { result } = await res.json();
      const address = result?.address?.address;
      if (!address) throw new Error("Could not resolve Ethereum address for this user");

      console.log("✅ Resolved wallet address:", address);

      // Read system metrics from a public RPC provider (no signer needed)
      const contractAddress = getContractAddress(chainId);
      const abi = getChainAbi(chainId);
      const rpcUrl = getChainRpcUrl(chainId);
      const readProvider = new ethers.providers.JsonRpcProvider(rpcUrl);

      let currentTaxBN;
      try {
        const readContract = new ethers.Contract(contractAddress, abi, readProvider);
        const systemMetrics = await readContract.getSystemMetrics();
        currentTaxBN = systemMetrics?.currentTax || ethers.utils.parseEther("0.000029");
      } catch (metricsError) {
        console.error("Error getting system metrics:", metricsError);
        currentTaxBN = ethers.utils.parseEther("0.000029");
      }

      // Encode transaction data for activateBeacon and ask the injected Farcaster provider to send the tx
      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData('activateBeacon', []);
      const txParams: any = {
        to: contractAddress,
        data,
        value: ethers.BigNumber.from(currentTaxBN).toHexString(),
      };

      const ethProvider = (window as any).ethereum;
      if (!ethProvider || !ethProvider.request) throw new Error('Injected ethereum provider not available');

      // Ensure `from` is provided — try provider accounts first, fallback to Farcaster primary address
      let fromAccount: string | undefined;
      try {
        const accounts: string[] = await ethProvider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) fromAccount = accounts[0];
      } catch (acctErr) {
        console.warn('Could not read eth_accounts from provider, will fallback to Farcaster primary address', acctErr);
      }
      if (!fromAccount && address) fromAccount = address;
      if (!fromAccount) throw new Error('No from account available for transaction');

      txParams.from = fromAccount;

      // Determine if injected provider is Farcaster's built-in provider
      let isFarcasterProvider = false;
      try {
        isFarcasterProvider = !!((window as any).ethereum && (window as any).ethereum.isFarcaster);
      } catch (e) {
        isFarcasterProvider = false;
      }

      // If running inside Farcaster miniapp, run a preflight capability/chain check
      try {
        const caip2 = `eip155:${chainId}`;
        // debug log
        console.log('🔍 MiniApp supportedChains (preflight):', miniApp.supportedChains);
        if (isFarcasterProvider && !miniApp.supportsChain(caip2)) {
          const chainName = (SUPPORTED_CHAINS as any)[chainId]?.chainName || `Chain ${chainId}`;
          const msg = `Farcaster in-app wallet does not support ${chainName} (chainId ${chainId}). Use an external wallet or contact Farcaster.`;
          console.warn('⚠️ Preflight fail:', msg);
          toast.error(msg);
          setProcessingChainId(null);
          return;
        }
      } catch (miniErr) {
        console.warn('⚠️ MiniApp preflight check failed or not available:', miniErr);
      }

      // Ensure provider is on the desired chain; request switch only for non-Farcaster providers
      try {
        const currentChainIdHex = await ethProvider.request({ method: 'eth_chainId' });
        const desiredChain = (SUPPORTED_CHAINS as any)[chainId];
        const desiredChainHex = desiredChain?.chainId || `0x${chainId.toString(16)}`;
        if (currentChainIdHex !== desiredChainHex) {
          if (isFarcasterProvider) {
            // Farcaster built-in wallet may handle cross-chain txs; avoid triggering external wallet prompts
            console.log('ℹ️ Farcaster provider detected — skipping wallet_switchEthereumChain to avoid external wallet prompts');
          } else {
            try {
              await ethProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: desiredChainHex }]
              });
              console.log('🔁 Switched provider to desired chain', desiredChainHex);
            } catch (switchErr) {
              console.warn('Could not switch provider chain (user may need to approve):', switchErr);
              // continue; user may still approve tx on the provider UI
            }
          }
        }
      } catch (cErr) {
        console.warn('Could not determine provider chainId:', cErr);
      }

      // Estimate gas using public read provider to avoid provider.getAddress limitations
      let gasLimitHex: string | undefined;
      try {
        const estimate = await readProvider.estimateGas({ to: contractAddress, data, value: ethers.BigNumber.from(currentTaxBN) });
        const gasLimit = estimate.mul(120).div(100); // 1.2x
        gasLimitHex = gasLimit.toHexString();
      } catch (estErr) {
        console.warn('Gas estimation failed via read provider, falling back to default gas limit:', estErr);
        gasLimitHex = ethers.BigNumber.from(150000).toHexString();
      }

      // Attach gas and chainId to tx params
      try {
        const desiredChain = (SUPPORTED_CHAINS as any)[chainId];
        const desiredChainHex = desiredChain?.chainId || `0x${chainId.toString(16)}`;
        txParams.gas = gasLimitHex;
        txParams.chainId = desiredChainHex;
      } catch (attachErr) {
        console.warn('Unable to attach gas/chainId to tx params:', attachErr);
      }

      console.log('📡 Sending transaction via injected provider...');
      const txHash: string = await ethProvider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });
      console.log('✅ Transaction sent (txHash):', txHash);

      // Wait for confirmation using the public RPC provider
      let receipt = null;
      const MAX_ATTEMPTS = 60;
      let attempts = 0;
      while (!receipt && attempts < MAX_ATTEMPTS) {
        receipt = await readProvider.getTransactionReceipt(txHash);
        if (!receipt) {
          await delay(3000);
          attempts++;
        }
      }

      if (!receipt) throw new Error('Transaction not found after waiting');
      console.log('✅ Transaction confirmed:', receipt.transactionHash);

      // Update state success
      setSuccessChainId(chainId);
      if (onCheckinSuccess) onCheckinSuccess(chainId, receipt.transactionHash);

    } catch (error: any) {
      console.error("❌ Failed to perform checkin:", error);
      let msg = error.message || "Unknown error occurred.";
      toast.error(msg);
    } finally {
      setProcessingChainId(null);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Available";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  
  const isTestnet = (chain: Chain): boolean => {
    return chain.chainName.toLowerCase().includes('testnet') || 
           chain.chainName.toLowerCase().includes('sepolia') ||
           chain.chainName.toLowerCase().includes('goerli') ||
           chain.chainName.toLowerCase().includes('mumbai') ||
           chain.chainName.toLowerCase().includes('alfajores') ||
           chain.chainName.toLowerCase().includes('fuji') ||
           chain.chainName.toLowerCase().includes('holesky') ||
           chain.id === 11155111 || 
           chain.id === 5 ||       
           chain.id === 43113 ||   
           chain.id === 17000;     
  };
  
  const supportedChains: Chain[] = getSupportedChainIds().map(id => ({
    id,
    ...SUPPORTED_CHAINS[id],
    status: chainStatusMap[id] || {
      canCheckin: true,
      lastCheckin: null,
      timeUntilNextCheckin: 0
    }
  }));

  const getFilteredAndSortedChains = (): Chain[] => {
    let filteredChains = [...supportedChains];
    
    if (networkType !== 'all') {
      filteredChains = filteredChains.filter(chain => {
        if (networkType === 'testnet') {
          return isTestnet(chain);
        } else {
          return !isTestnet(chain);
        }
      });
    }
    
    switch (filter) {
      case 'available':
        filteredChains = filteredChains.filter(chain => 
          chain.status.canCheckin && chain.status.timeUntilNextCheckin === 0
        );
        break;
      case 'checked':
        filteredChains = filteredChains.filter(chain => 
          !chain.status.canCheckin || chain.status.timeUntilNextCheckin > 0
        );
        break;
      case 'favorites':
        filteredChains = filteredChains.filter(chain => 
          favoriteChains.includes(chain.id)
        );
        break;
    }
    
    switch (sortOption) {
      case 'name':
        filteredChains.sort((a, b) => a.chainName.localeCompare(b.chainName));
        break;
      case 'status':
        filteredChains.sort((a, b) => {
          if (a.status.canCheckin && !b.status.canCheckin) return -1;
          if (!a.status.canCheckin && b.status.canCheckin) return 1;
          
          return a.status.timeUntilNextCheckin - b.status.timeUntilNextCheckin;
        });
        break;
    }
    
    return filteredChains;
  };
  
  const filteredChains = getFilteredAndSortedChains();

  const availableChainCount = filteredChains.filter(
    chain => chain.status.canCheckin && chain.status.timeUntilNextCheckin === 0
  ).length;

  const getNetworkConfig = () => {
    switch (networkType) {
      case 'testnet':
        return {
          icon: FaFlask,
          gradient: 'from-blue-500/10 to-cyan-500/10',
          textColor: 'text-blue-600 dark:text-blue-400',
          badgeColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        };
      case 'mainnet':
        return {
          icon: FaGlobe,
          gradient: 'from-cyan-500/10 to-blue-500/10',
          textColor: 'text-cyan-600 dark:text-cyan-400',
          badgeColor: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
        };
      default:
        return {
          icon: FaLayerGroup,
          gradient: 'from-blue-500/8 to-cyan-500/8',
          textColor: 'text-slate-700 dark:text-slate-300',
          badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        };
    }
  };

  const networkConfig = getNetworkConfig();
  const NetworkIcon = networkConfig.icon;

  return (
    <div className="w-full pt-8 pb-16">
      {/* Title & Compact Controls (Base-only, mobile friendly) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full sm:w-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 flex-shrink-0">
              <NetworkIcon className="text-white" size={16} />
            </div>
            Say GM
            <div className={`ml-3 ${networkConfig.badgeColor} text-xs sm:text-sm font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-current/20`}>
              {availableChainCount} Available
            </div>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-end"
        >
          {/* Filter Button (icon-only on mobile) */}
          <div className="relative z-30">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="group flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:shadow hover:scale-[1.02] transition-all duration-200"
            >
              <div className="p-1 rounded-md bg-cyan-50 dark:bg-cyan-900/20">
                <FaFilter className="text-cyan-600 dark:text-cyan-300" size={12} />
              </div>
              <span className="hidden sm:inline">Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
              <span className="sm:hidden text-xs">Filter</span>
              <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isFilterMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isFilterMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl z-20 overflow-hidden"
                >
                  <div className="py-1">
                    {['all', 'available', 'checked', 'favorites'].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilter(option as FilterType);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${filter === option ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-50 dark:hover:bg-slate-700/30`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort (compact) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="pl-3 pr-3 py-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:shadow transition-all duration-200"
              aria-expanded={isSortDropdownOpen}
            >
              <span className="hidden sm:inline">{SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || 'Sort'}</span>
              <span className="sm:hidden">Sort</span>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/60 dark:border-slate-700/60 rounded-xl shadow-xl z-30">
                {SORT_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    onClick={() => { setSortOption(option.value); setIsSortDropdownOpen(false); }}
                    className={`px-4 py-2 text-sm cursor-pointer ${sortOption === option.value ? 'bg-purple-500/10 dark:bg-purple-500/20 font-semibold' : 'text-gray-800 dark:text-gray-100'}`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh - icon-only on mobile */}
          <button
            onClick={checkAllChainsStatus}
            disabled={isLoading || !isConnected}
            className="ml-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/50 dark:border-cyan-700/30 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:shadow transition-all duration-200"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </motion.div>
      </div>

      {!isConnected && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FaWallet className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Wallet Required</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Connect your wallet to say GM on multiple blockchain networks and start your daily journey.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isConnected && filteredChains.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 px-6 bg-white/40 dark:bg-slate-800/20 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <FaMoon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {filter === 'favorites' 
              ? "No favorite chains yet. Add some by clicking the star icon." 
              : filter === 'available' 
                ? `No available chains to say GM right now in ${networkType === 'testnet' ? 'testnet' : networkType === 'mainnet' ? 'mainnet' : 'any'} networks.`
                : filter === 'checked'
                  ? "You haven't said GM on any chains yet."
                  : "No chains match your filters."}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredChains.map((chain, index) => {
          const chainStatus = chain.status;
          const isCurrentChain = currentChainId === chain.id;
          const isProcessing = processingChainId === chain.id;
          const isSuccess = successChainId === chain.id;
          const isFavorite = favoriteChains.includes(chain.id);
          const canActivateNow = chainStatus.canCheckin && chainStatus.timeUntilNextCheckin === 0;
          const isSwitchingToThisChain = networkSwitchingChainId === chain.id;

          return (
            <motion.div 
              key={chain.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`
                rounded-xl overflow-hidden backdrop-blur-xl transition-all duration-300
                relative
                ${isCurrentChain 
                  ? 'border border-blue-200 dark:border-blue-400/50 bg-gradient-to-br from-blue-50/60 to-cyan-50/60 dark:from-blue-900/70 dark:to-cyan-900/70 shadow-md'
                  : 'border border-gray-200/60 dark:border-slate-700/60 bg-cyan-50/30 dark:bg-cyan-900/30 hover:shadow-md shadow-sm'
                } 
                ${isSuccess ? 'ring-2 ring-cyan-400/40' : ''}
              `}
              style={{ 
                isolation: 'isolate', 
                minHeight: '200px'
              }}
            >
              <div className="p-4 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                        isCurrentChain 
                          ? 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900/30' 
                          : 'bg-gray-100 dark:bg-slate-700/50'
                      } transition-all duration-300`}>
                        <ChainLogo 
                          logoUrl={chain.logoUrl}
                          altText={chain.chainName}
                          size="lg"
                          fallbackIcon="🔗"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">{chain.chainName}</h3>
                        <div className="flex items-center mt-1">
                          {chainStatus.timeUntilNextCheckin > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30 flex items-center gap-1">
                              <FaClock className="w-2 h-2" />
                              {formatTime(chainStatus.timeUntilNextCheckin)}
                            </span>
                          ) : chainStatus.canCheckin ? (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-700/30">
                              Ready
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/30">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(chain.id)}
                      className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 transition-all duration-200 p-1 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      aria-label={`Toggle favorite for ${chain.chainName}`}
                    >
                      {isFavorite ? (
                        <FaStar className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                      ) : (
                        <FaRegStar className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConnected && canActivateNow && !isProcessing && !isLoading) {
                      handleCheckin(chain.id);
                    }
                  }}
                  className={`w-full mt-3 py-3 px-4 text-sm font-medium flex items-center justify-center transition-all duration-300 rounded-xl shadow-md ${
                    !isConnected || !canActivateNow || processingChainId !== null || isLoading
                      ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-400/80 to-cyan-400 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-md'
                  }`}
                  disabled={!isConnected || !canActivateNow || processingChainId !== null || isLoading}
                >
                  {isProcessing || isSwitchingToThisChain ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                      <span>{isSwitchingToThisChain ? 'Switching...' : 'Sending...'}</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <FaCheckCircle className="h-4 w-4 mr-2" />
                      <span>GM Sent!</span>
                    </>
                  ) : !isConnected ? (
                    <>
                      <FaWallet className="h-4 w-4 mr-2" />
                      <span>Connect Wallet</span>
                    </>
                  ) : chainStatus.timeUntilNextCheckin > 0 ? (
                    <>
                      <FaClock className="h-4 w-4 mr-2" />
                      <span>Wait {formatTime(chainStatus.timeUntilNextCheckin)}</span>
                    </>
                  ) : canActivateNow ? (
                    <>
                      <span>GM on {chain.chainName}</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="h-4 w-4 mr-2" />
                      <span>Already GM'd</span>
                    </>
                  )}
                </button>
              </div>
              {successAnimationData.visible && 
              successAnimationData.chainId === chain.id && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  <SuccessAnimation
                    isVisible={true}
                    checkinCount={1}
                    streak={userStats?.currentStreak || 0}
                    chainName={successAnimationData.chainName}
                    position="card"
                    soundEnabled={true}
                    onComplete={() => {
                      setSuccessAnimationData({ 
                        visible: false, 
                        chainId: null, 
                        chainName: '' 
                      });
                      if (onAnimationComplete) {
                        onAnimationComplete();
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiChainCheckinGrid;
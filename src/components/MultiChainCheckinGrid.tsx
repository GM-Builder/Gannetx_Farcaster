import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaSpinner, FaCheckCircle, FaClock, FaWallet,
  FaGlobe,
} from 'react-icons/fa';
import {
  SUPPORTED_CHAINS,
  getSupportedChainIds,
  getContractAddress,
  getChainRpcUrl,
  getChainAbi,
} from '@/utils/constants';
import {
  delay
} from '@/utils/web3';
import { ethers } from 'ethers';
import ChainLogo from '@/components/ChainLogo';
import toast from 'react-hot-toast';
import SuccessAnimation from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/components/SuccessAnimationContext';
import { useUserStats } from '@/hooks/useSubgraph';
import { useFarcasterUser } from '@/hooks/useFarcasterContext'; // Import context to get user name

type ChainCheckinStatus = {
  canCheckin: boolean;
  lastCheckin: number | null;
  timeUntilNextCheckin: number;
};

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
  networkType?: 'all' | 'mainnet' | 'testnet'; // Kept in interface but unused in UI
  triggerAnimation?: { chainId: number; chainName: string } | null;
  onAnimationComplete?: () => void;
}

const MultiChainCheckinGrid: React.FC<MultiChainCheckinGridProps> = ({
  isConnected,
  currentChainId,
  address,
  signer,
  provider,
  onCheckinSuccess,
  triggerAnimation,
  onAnimationComplete,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingChainId, setProcessingChainId] = useState<number | null>(null);
  const [successChainId, setSuccessChainId] = useState<number | null>(null);
  const [chainStatusMap, setChainStatusMap] = useState<Record<number, ChainCheckinStatus>>({});
  const [successAnimationData, setSuccessAnimationData] = useState<{
    visible: boolean;
    chainId: number | null;
    chainName: string;
  }>({
    visible: false,
    chainId: null,
    chainName: '',
  });

  const { data: userStats } = useUserStats(address || undefined);
  const { user } = useFarcasterUser(); // Get Farcaster user info

  // Animation trigger effect
  useEffect(() => {
    if (triggerAnimation) {
      setSuccessAnimationData({
        visible: true,
        chainId: triggerAnimation.chainId,
        chainName: triggerAnimation.chainName,
      });
    }
  }, [triggerAnimation]);

  // Success message timer
  useEffect(() => {
    if (successChainId) {
      const timer = setTimeout(() => setSuccessChainId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successChainId]);

  // Status countdown timer
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

  // Initial status check
  useEffect(() => {
    if (isConnected && address && signer) {
      checkAllChainsStatus();
    } else {
      setChainStatusMap({});
    }
  }, [isConnected, address, signer]);

  const checkAllChainsStatus = async (): Promise<void> => {
    if (!isConnected || !signer || !address) {
      console.log("Not connected or missing signer/address");
      return;
    }

    setIsLoading(true);
    const supportedChainIds = getSupportedChainIds(); // Get ALL chains
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

            // Use server-side endpoint to avoid CORS issues with public RPC nodes
            try {
              const resp = await fetch('/api/chain-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chainId, address })
              });

              if (!resp.ok) {
                // console.warn(`Server chain-status error for ${chainId}: ${resp.status}`);
                return { chainId, status: statusMap[chainId] };
              }

              const data = await resp.json();
              if (data && data.status) {
                return { chainId, status: data.status };
              }

              return { chainId, status: statusMap[chainId] };
            } catch (err) {
              // console.error(`Error fetching chain status from server for ${chainId}:`, err);
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

        setChainStatusMap({ ...statusMap });

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

      // Validate wallet is connected
      if (!address) throw new Error("Wallet not connected. Please connect your wallet first.");

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      if (!provider) throw new Error("Ethereum provider not found.");

      console.log("✅ Using connected wallet address:", address);

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

      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData('activateBeacon', []);
      const txParams: any = {
        to: contractAddress,
        data,
        value: ethers.BigNumber.from(currentTaxBN).toHexString(),
      };

      const ethProvider = (window as any).ethereum;
      if (!ethProvider || !ethProvider.request) throw new Error('Injected ethereum provider not available');

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

      let isFarcasterProvider = false;
      try {
        isFarcasterProvider = !!((window as any).ethereum && (window as any).ethereum.isFarcaster);
      } catch (e) {
        isFarcasterProvider = false;
      }


      try {
        const currentChainIdHex = await ethProvider.request({ method: 'eth_chainId' });
        const desiredChain = (SUPPORTED_CHAINS as any)[chainId];
        const desiredChainHex = desiredChain?.chainId || `0x${chainId.toString(16)}`;
        if (currentChainIdHex !== desiredChainHex) {
          if (isFarcasterProvider) {
            console.log('ℹ️ Farcaster provider detected — skipping wallet_switchEthereumChain');
          } else {
            try {
              await ethProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: desiredChainHex }]
              });
              console.log('🔁 Switched provider to desired chain', desiredChainHex);
            } catch (switchErr) {
              console.warn('Could not switch provider chain (user may need to approve):', switchErr);
            }
          }
        }
      } catch (cErr) {
        console.warn('Could not determine provider chainId:', cErr);
      }

      let gasLimitHex: string | undefined;
      try {
        const estimate = await readProvider.estimateGas({ to: contractAddress, data, value: ethers.BigNumber.from(currentTaxBN) });
        const gasLimit = estimate.mul(120).div(100);
        gasLimitHex = gasLimit.toHexString();
      } catch (estErr) {
        console.warn('Gas estimation failed via read provider, falling back to default gas limit:', estErr);
        gasLimitHex = ethers.BigNumber.from(150000).toHexString();
      }

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

  // Get all supported chains without filtering
  const filteredChains: Chain[] = getSupportedChainIds()
    // Filter out testnets
    .filter(id => !SUPPORTED_CHAINS[id].isTestnet)
    // Sort logic moved here directly: first by status (can checkin), then by name
    .sort((aId, bId) => {
      const a = chainStatusMap[aId] || { canCheckin: true, timeUntilNextCheckin: 0 };
      const b = chainStatusMap[bId] || { canCheckin: true, timeUntilNextCheckin: 0 };

      // Priority 1: Can Checkin Now
      const aReady = a.canCheckin && a.timeUntilNextCheckin === 0;
      const bReady = b.canCheckin && b.timeUntilNextCheckin === 0;

      if (aReady && !bReady) return -1;
      if (!aReady && bReady) return 1;

      // Priority 2: Wait Time (shorter wait first)
      if (a.timeUntilNextCheckin !== b.timeUntilNextCheckin) {
        return a.timeUntilNextCheckin - b.timeUntilNextCheckin;
      }

      // Priority 3: Name
      return (SUPPORTED_CHAINS[aId]?.chainName || '').localeCompare(SUPPORTED_CHAINS[bId]?.chainName || '');
    })
    .map(id => ({
      id,
      ...SUPPORTED_CHAINS[id],
      status: chainStatusMap[id] || {
        canCheckin: true,
        lastCheckin: null,
        timeUntilNextCheckin: 0
      }
    }));


  // Helper to get display name
  const getDisplayName = () => {
    if (!user) return 'Hunter';
    if (user.displayName) return user.displayName;
    if (user.username) {
      // Remove .base.eth if present
      return user.username.replace(/\.base\.eth$/, '');
    }
    return 'Hunter';
  };

  return (
    <div className="w-full pt-8 pb-16">
      {/* Title & Compact Controls */}
      <div className="flex flex-row justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              GM {getDisplayName()}
            </h2>

            {/* Refresh Button - Moved here as requested: "posisikan di sebalah kiri sejajar dengan icon refresh" -> interpreted as aligned next to the title text */}
            <button
              onClick={checkAllChainsStatus}
              disabled={isLoading || !isConnected}
              className="p-2 rounded-lg bg-[#0B0E14] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
              title="Refresh Status"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin text-cyan-400" size={14} />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredChains.map((chain, index) => {
          const chainStatus = chain.status;
          const isCurrentChain = currentChainId === chain.id;
          const isProcessing = processingChainId === chain.id;
          const isSuccess = successChainId === chain.id;
          const canActivateNow = chainStatus.canCheckin && chainStatus.timeUntilNextCheckin === 0;

          return (
            <motion.div
              key={chain.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`
                rounded-xl overflow-hidden transition-all duration-300
                relative
                ${isCurrentChain
                  ? 'border border-cyan-500/30 bg-[#0B0E14] shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'border border-gray-800 bg-[#0B0E14] hover:border-gray-700 shadow-xl'
                } 
                ${isSuccess ? 'ring-2 ring-cyan-400/50' : ''}
              `}
              style={{
                minHeight: '200px'
              }}
            >
              <div className="p-4 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${isCurrentChain
                        ? 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900/30'
                        : 'bg-white/5 border border-white/5'
                        } transition-all duration-300`}>
                        <ChainLogo
                          logoUrl={chain.logoUrl}
                          altText={chain.chainName}
                          size="lg"
                          fallbackIcon="🔗"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm leading-tight">{chain.chainName}</h3>
                        <div className="flex items-center mt-1">
                          {chainStatus.timeUntilNextCheckin > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                              <FaClock className="w-2 h-2" />
                              {formatTime(chainStatus.timeUntilNextCheckin)}
                            </span>
                          ) : chainStatus.canCheckin ? (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Ready
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConnected && canActivateNow && !isProcessing && !isLoading) {
                      handleCheckin(chain.id);
                    }
                  }}
                  className={`w-full mt-3 py-3 px-4 text-sm font-medium flex items-center justify-center transition-all duration-300 rounded-xl shadow-md ${!isConnected || !canActivateNow || processingChainId !== null || isLoading
                    ? 'bg-[#0B0E14]/60 border border-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg border border-white/5'
                    }`}
                  disabled={!isConnected || !canActivateNow || processingChainId !== null || isLoading}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                      <span>Sending...</span>
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
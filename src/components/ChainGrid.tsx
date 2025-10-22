import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLeaf, FaSpinner, FaCheckCircle, FaHourglassHalf, 
  FaClock, FaWallet, FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  CHECKIN_FEE, 
  SUPPORTED_CHAINS, 
  getSupportedChainIds,
  isChainSupported 
} from '@/utils/constants';
import { performCheckin, switchToChain } from '@/utils/web3';
import { ethers } from 'ethers';
import ChainLogo from '@/components/ChainLogo';

interface ChainGridProps {
  canCheckin: boolean;
  isLoading: boolean;
  chainId?: number | null;
  isConnected?: boolean;
  timeUntilNextCheckin?: number;
  onCountdownComplete?: () => void;
  onCheckinSuccess?: (chainId: number, txHash: string) => void;
  contract?: ethers.Contract | null;
}

const ChainGrid: React.FC<ChainGridProps> = ({
  canCheckin,
  isLoading: isLoadingProp,
  chainId: currentChainId,
  isConnected = false,
  timeUntilNextCheckin = 0,
  onCountdownComplete,
  onCheckinSuccess,
  contract
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(isLoadingProp);
  const [processingChainId, setProcessingChainId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successChainId, setSuccessChainId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [favoriteChains, setFavoriteChains] = useState<number[]>([]);
  
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeUntilNextCheckin);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(timeUntilNextCheckin > 0);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteChains');
    if (savedFavorites) {
      try {
        setFavoriteChains(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing favorite chains', e);
        setFavoriteChains([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteChains', JSON.stringify(favoriteChains));
  }, [favoriteChains]);

  useEffect(() => {
    setIsLoading(isLoadingProp);
  }, [isLoadingProp]);

  useEffect(() => {
    setSecondsRemaining(timeUntilNextCheckin);
    setIsCountdownActive(timeUntilNextCheckin > 0);
  }, [timeUntilNextCheckin]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCountdownActive) {
      interval = setInterval(() => {
        setSecondsRemaining((seconds) => {
          if (seconds <= 1) {
            setIsCountdownActive(false);
            if (onCountdownComplete) onCountdownComplete();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, onCountdownComplete]);

  useEffect(() => {
    if (successChainId) {
      const timer = setTimeout(() => setSuccessChainId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successChainId]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const toggleFavorite = (chainId: number) => {
    setFavoriteChains(prev => {
      if (prev.includes(chainId)) {
        return prev.filter(id => id !== chainId);
      } else {
        return [...prev, chainId];
      }
    });
  };

  const handleCheckin = async (chainId: number) => {
    if (!canCheckin || isLoading || !contract || processingChainId !== null) return;
    
    try {
      setProcessingChainId(chainId);
      setErrorMessage(null);
      
      if (currentChainId !== chainId) {
        await switchToChain(chainId);
      }
      
      const tx = await performCheckin(contract, chainId);
      
      const receipt = await tx.wait();
      
      setSuccessChainId(chainId);
      
      if (onCheckinSuccess) {
        onCheckinSuccess(chainId, receipt.transactionHash);
      }
    } catch (error: unknown) {
      console.error("Error performing checkin:", error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Failed to activate beacon (Unknown Error)"
      );
    } finally {
      setProcessingChainId(null);
    }
  };

  const formatTime = (seconds: number): string => {
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
  
  const supportedChains = getSupportedChainIds().map(id => ({
    id,
    ...SUPPORTED_CHAINS[id]
  }));

  const displayedChains = activeTab === 'favorites' 
    ? supportedChains.filter(chain => favoriteChains.includes(chain.id))
    : supportedChains;

  return (
    <div className="w-full">
      <div className="flex border-b border-cyan-500/20 dark:border-cyan-500/30 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'all' 
              ? 'text-cyan-600 border-b-2 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400'
              : 'text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Networks ({supportedChains.length})
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'favorites' 
              ? 'text-cyan-600 border-b-2 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400'
              : 'text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-300'
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favoriteChains.length})
        </button>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg p-3 text-red-600 dark:text-red-300 text-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <FaExclamationTriangle className="h-4 w-4" />
              </div>
              <div className="ml-2">{errorMessage}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCountdownActive && (
        <div className="mb-6 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg p-4 border border-cyan-100 dark:border-cyan-800/30">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FaHourglassHalf className="w-5 h-5 text-cyan-500 mr-2" />
                <h4 className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                  Next Beacon Activation
                </h4>
              </div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-xs text-gray-600 dark:text-cyan-300/70">
                Time remaining until next activation
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && favoriteChains.length === 0 && (
        <div className="text-center py-10 px-4 bg-slate-800/20 rounded-lg border border-cyan-500/20">
          <p className="text-gray-300">No favorite networks yet. Add some from the "All Networks" tab.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedChains.map((chain) => {
          const isCurrentChain = currentChainId === chain.id;
          const isProcessing = processingChainId === chain.id;
          const isSuccess = successChainId === chain.id;
          const isFavorite = favoriteChains.includes(chain.id);
          
          return (
            <div 
              key={chain.id}
              className={`rounded-xl p-4 border transition-all duration-300 ${
                isCurrentChain 
                  ? 'border-cyan-200 dark:border-cyan-700/50 bg-cyan-50 dark:bg-cyan-900/20'
                  : 'border-gray-200 dark:border-cyan-500/20 bg-white dark:bg-slate-800/20'
              } ${isSuccess ? 'ring-2 ring-cyan-500 ring-opacity-50' : ''} hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mr-3">
                    <ChainLogo 
                      logoUrl={chain.logoUrl}
                      altText={chain.chainName}
                      size="md"
                      fallbackIcon="🔗"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{chain.chainName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {chain.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(chain.id)}
                  className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 transition-colors"
                >
                  <svg className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 dark:text-yellow-400 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-700/20 rounded-lg p-3 mb-3 border border-gray-100 dark:border-cyan-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Fee:</span>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                    {CHECKIN_FEE} {chain.nativeCurrency.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isChainSupported(chain.id) 
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {isChainSupported(chain.id) ? 'Ready!' : 'Not Supported'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleCheckin(chain.id)}
                disabled={
                  !canCheckin || 
                  !isConnected || 
                  isCountdownActive || 
                  !isChainSupported(chain.id) || 
                  processingChainId !== null || 
                  isLoading
                }
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-300 ${
                  !canCheckin || !isConnected || isCountdownActive || chain.status !== 'Ready!' || processingChainId !== null || isLoading
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white shadow-sm hover:shadow'
                }`}
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    <span>Activating...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <FaCheckCircle className="h-4 w-4 mr-2" />
                    <span>Activated!</span>
                  </>
                ) : !isConnected ? (
                  <>
                    <FaWallet className="h-4 w-4 mr-2" />
                    <span>Connect Wallet</span>
                  </>
                ) : isCountdownActive ? (
                  <>
                    <FaClock className="h-4 w-4 mr-2" />
                    <span>Wait {formatTime(secondsRemaining)}</span>
                  </>
                ) : (
                  <>
                    <FaLeaf className="h-4 w-4 mr-2" />
                    <span>Activate Beacon</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChainGrid;
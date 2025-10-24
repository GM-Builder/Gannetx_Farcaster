// src/components/Settings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMoon, 
  FaSun, 
  FaGem, 
  FaRocket,
  FaChevronRight,
  FaChevronDown,
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
} from 'react-icons/fa';
import { getMainnetChainIds, SUPPORTED_CHAINS } from '@/utils/constants';
import ChainLogo from '@/components/ChainLogo';
import Link from 'next/link';

interface SettingsProps {
  currentChainId?: number | null;
  onSwitchChain?: (chainId: number) => Promise<void>;
  isSwitchingChain?: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  currentChainId,
  onSwitchChain,
  isSwitchingChain = false,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState(false);
  const [showDeployTooltip, setShowDeployTooltip] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('musicEnabled') !== 'false';
    }
    return true;
  });

  const mainnetChainIds = getMainnetChainIds();
  const mainnetChains = mainnetChainIds.map(id => ({
    id,
    ...SUPPORTED_CHAINS[id]
  }));

  const currentChain = currentChainId ? SUPPORTED_CHAINS[currentChainId] : null;

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  };

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicEnabled', newState.toString());
      window.dispatchEvent(new CustomEvent('toggle-music', { detail: { enabled: newState } }));
    }
  };

  const handleChainSwitch = async (chainId: number) => {
    if (onSwitchChain && !isSwitchingChain) {
      setIsChainSelectorOpen(false);
      await onSwitchChain(chainId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Theme Toggle */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              {isDarkMode ? (
                <FaMoon className="text-blue-500" />
              ) : (
                <FaSun className="text-yellow-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: isDarkMode ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Music Toggle */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              {isMusicEnabled ? (
                <FaVolumeUp className="text-purple-500" />
              ) : (
                <FaVolumeMute className="text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Background Music</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isMusicEnabled ? 'Playing' : 'Muted'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMusic}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isMusicEnabled ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: isMusicEnabled ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Network Selector */}
      {currentChain && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setIsChainSelectorOpen(!isChainSelectorOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <ChainLogo 
                  logoUrl={currentChain.logoUrl}
                  altText={currentChain.chainName}
                  size="md"
                  fallbackIcon="🔗"
                />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white text-sm">Network</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentChain.chainName}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isChainSelectorOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown className="text-gray-400" />
            </motion.div>
          </button>

          {isChainSelectorOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="max-h-64 overflow-y-auto">
                {mainnetChains.map((chain) => {
                  const isCurrentChain = currentChainId === chain.id;
                  
                  return (
                    <button
                      key={chain.id}
                      onClick={() => handleChainSwitch(chain.id)}
                      disabled={isCurrentChain || isSwitchingChain}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                        isCurrentChain
                          ? 'bg-cyan-50 dark:bg-cyan-900/20'
                          : 'hover:bg-white dark:hover:bg-gray-800/50'
                      } ${isSwitchingChain ? 'opacity-50' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <ChainLogo 
                          logoUrl={chain.logoUrl}
                          altText={chain.chainName}
                          size="sm"
                          fallbackIcon="🔗"
                        />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {chain.chainName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {chain.nativeCurrency.symbol}
                        </div>
                      </div>
                      
                      {isCurrentChain && (
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Mint NFT Button */}
      <Link href="/mint">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mt-3 bg-gradient-to-r from-[#00FFFF] to-cyan-400 rounded-xl p-4 shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <FaGem className="text-white text-lg" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1929] text-sm">Mint NFT</p>
                <p className="text-xs text-[#0A1929]/70">Early Adopter Collection</p>
              </div>
            </div>
            <FaChevronRight className="text-[#0A1929]/50" />
          </div>
        </motion.div>
      </Link>

      {/* Deploy Button (Coming Soon) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onHoverStart={() => setShowDeployTooltip(true)}
        onHoverEnd={() => setShowDeployTooltip(false)}
        className="relative bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg opacity-75 cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FaRocket className="text-white text-lg" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Deploy</p>
              <p className="text-xs text-white/70">Coming Soon</p>
            </div>
          </div>
        </div>

        {showDeployTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-purple-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
          >
            Feature coming soon
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-900 rotate-45"></div>
          </motion.div>
        )}
      </motion.div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">About</p>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Network</span>
            <span className="font-semibold">Multi-chain</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span className="font-semibold">Farcaster Mini App</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
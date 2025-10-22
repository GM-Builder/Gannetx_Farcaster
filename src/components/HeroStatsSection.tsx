// src/components/HeroStatsSection.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaGlobe, FaTrophy, FaMedal } from 'react-icons/fa';
import ChainLogo from './ChainLogo';
import { SUPPORTED_CHAINS, ChainConfig } from '@/utils/constants';

interface HeroStatsSectionProps {
  // Current Chain Stats
  currentChainId: number | null;
  currentChainName: string;
  currentChainCheckins: number;
  currentChainStreak: number;
  
  // Global Stats
  totalCheckins: number;
  totalChains: number;
  maxStreak: number;
  
  // User Ranking (NEW)
  userRank?: number;
  totalUsers?: number;
  
  loading: boolean;
}

// CountUp Animation Component
const CountUpNumber: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 1000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

const HeroStatsSection: React.FC<HeroStatsSectionProps> = ({
  currentChainId,
  currentChainName,
  currentChainCheckins,
  currentChainStreak,
  totalCheckins,
  totalChains,
  maxStreak,
  userRank = 0,
  totalUsers = 0,
  loading,
}) => {
  const chainConfig: ChainConfig | undefined = currentChainId ? SUPPORTED_CHAINS[currentChainId] : undefined;
  
  // Calculate ranking percentage
  const rankPercentage = totalUsers > 0 ? ((userRank / totalUsers) * 100).toFixed(1) : 0;
  
  // Determine rank tier for styling
  const getRankTier = () => {
    if (userRank === 0) return { color: 'gray', label: 'Unranked', gradient: 'from-gray-400 to-gray-500', emoji: '🏅' };
    if (userRank <= 10) return { color: 'gold', label: 'Top 10', gradient: 'from-yellow-400 to-yellow-600', emoji: '🏆' };
    if (userRank <= 50) return { color: 'silver', label: 'Top 50', gradient: 'from-gray-300 to-gray-400', emoji: '🥈' };
    if (userRank <= 100) return { color: 'bronze', label: 'Top 100', gradient: 'from-orange-400 to-orange-600', emoji: '🥉' };
    return { color: 'default', label: `Top ${rankPercentage}%`, gradient: 'from-purple-400 to-purple-600', emoji: '🏅' };
  };
  
  const rankTier = getRankTier();

  return (
    <div className="space-y-3">
      
      {/* Current Chain - Compact Horizontal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-800 shadow-md p-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {chainConfig && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 flex items-center justify-center flex-shrink-0">
                <ChainLogo
                  logoUrl={chainConfig.logoUrl}
                  altText={chainConfig.chainName}
                  size="sm"
                  fallbackIcon="🔗"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Current Chain
              </p>
              <h3 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 truncate">
                {currentChainName || 'No Chain'}
              </h3>
            </div>
          </div>
          
          {loading ? (
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <div className="text-right">
              <div className="text-xl font-black text-gray-900 dark:text-white">
                <CountUpNumber value={currentChainCheckins} />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                <FaFire className="text-[10px]" />
                {currentChainStreak}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid - 2 Cards Side by Side */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* All Chains Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-xl p-3 text-white shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-1 mb-2">
              <FaGlobe className="text-xs text-white/80" />
              <p className="text-[10px] text-cyan-100 font-medium">All Chains</p>
            </div>
            
            {loading ? (
              <div className="h-8 w-12 bg-white/20 animate-pulse rounded mb-1"></div>
            ) : (
              <motion.div
                key={totalCheckins}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-black mb-1 drop-shadow-lg"
              >
                <CountUpNumber value={totalCheckins} duration={800} />
              </motion.div>
            )}
            
            <p className="text-[10px] text-cyan-100 font-medium mb-2">Total GMs</p>
            
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold">
                {totalChains} {totalChains === 1 ? 'chain' : 'chains'}
              </div>
              {maxStreak > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <FaFire className="text-yellow-300 text-[10px]" />
                  <span className="text-[10px] font-bold">{maxStreak}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Ranking Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`bg-gradient-to-br ${rankTier.gradient} rounded-xl p-3 text-white shadow-md relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-1 mb-2">
              <FaTrophy className="text-xs text-yellow-300" />
              <p className="text-[10px] text-white/90 font-medium">Your Rank</p>
            </div>
            
            {loading ? (
              <div className="h-8 w-10 bg-white/20 animate-pulse rounded mb-1"></div>
            ) : userRank === 0 ? (
              <div className="text-center py-1">
                <FaMedal className="text-xl text-white/40 mx-auto mb-1" />
                <p className="text-[9px] text-white/70">Not ranked</p>
              </div>
            ) : (
              <>
                <motion.div
                  key={userRank}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black drop-shadow-lg mb-1"
                >
                  #{<CountUpNumber value={userRank} duration={800} />}
                </motion.div>
                
                <p className="text-[10px] text-white/90 font-medium mb-2">
                  of {totalUsers.toLocaleString()}
                </p>
                
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-xs">{rankTier.emoji}</span>
                  <span className="text-[9px] font-bold">{rankTier.label}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroStatsSection;
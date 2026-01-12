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
  onRankClick?: () => void;
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
  onRankClick,
}) => {
  const chainConfig: ChainConfig | undefined = currentChainId ? SUPPORTED_CHAINS[currentChainId] : undefined;

  // Calculate ranking percentage
  const rankPercentage = totalUsers > 0 ? ((userRank / totalUsers) * 100).toFixed(1) : 0;

  // Determine rank tier for styling
  const getRankTier = () => {
    if (userRank === 0) return { color: 'gray', label: 'Unranked', gradient: 'from-gray-700 to-gray-800', emoji: '🏅' };
    if (userRank <= 10) return { color: 'gold', label: 'Top 10', gradient: 'from-yellow-500/20 to-yellow-600/20', emoji: '🏆' };
    if (userRank <= 50) return { color: 'silver', label: 'Top 50', gradient: 'from-gray-400/20 to-gray-500/20', emoji: '🥈' };
    if (userRank <= 100) return { color: 'bronze', label: 'Top 100', gradient: 'from-orange-500/20 to-orange-600/20', emoji: '🥉' };
    return { color: 'default', label: `Top ${rankPercentage}%`, gradient: 'from-purple-500/20 to-purple-600/20', emoji: '🏅' };
  };

  const rankTier = getRankTier();

  return (
    <div className="space-y-3">

      {/* Current Chain - Compact Horizontal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0B0E14]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {chainConfig && (
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                <ChainLogo
                  logoUrl={chainConfig.logoUrl}
                  altText={chainConfig.chainName}
                  size="lg"
                  fallbackIcon="🔗"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Current Chain
              </p>
              <div className="text-sm font-bold text-white truncate mt-0.5">
                {currentChainName || 'No Chain'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-8 w-12 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="text-right">
              <div className="text-xl font-extrabold text-white">
                <CountUpNumber value={currentChainCheckins} />
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-orange-400 font-bold">
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
          className="bg-[#0B0E14]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan-500/20 transition-all duration-500" />

          <div className="relative">
            <div className="flex items-center gap-1.5 mb-3">
              <FaGlobe className="text-xs text-cyan-400" />
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total GMs</p>
            </div>

            {loading ? (
              <div className="h-8 w-12 bg-white/5 animate-pulse rounded mb-1"></div>
            ) : (
              <motion.div
                key={totalCheckins}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-extrabold text-white mb-1"
              >
                <CountUpNumber value={totalCheckins} duration={800} />
              </motion.div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="text-[10px] text-gray-400 font-medium">
                {totalChains} {totalChains === 1 ? 'chain' : 'chains'}
              </div>
              {maxStreak > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                  <FaFire className="text-orange-400 text-[10px]" />
                  <span className="text-[10px] font-bold text-orange-400">{maxStreak}</span>
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
          onClick={onRankClick}
          className={`bg-[#0B0E14]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 relative overflow-hidden group ${onRankClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
        >
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${rankTier.gradient} rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-70 transition-all duration-500`} />

          <div className="relative">
            <div className="flex items-center gap-1.5 mb-3">
              <FaTrophy className="text-xs text-yellow-400" />
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rank</p>
            </div>

            {loading ? (
              <div className="h-8 w-10 bg-white/5 animate-pulse rounded mb-1"></div>
            ) : userRank === 0 ? (
              <div className="text-center py-1">
                <FaMedal className="text-xl text-gray-600 mx-auto mb-1" />
                <p className="text-[9px] text-gray-500">Not ranked</p>
              </div>
            ) : (
              <>
                <motion.div
                  key={userRank}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-extrabold text-white mb-1"
                >
                  #{<CountUpNumber value={userRank} duration={800} />}
                </motion.div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-500 font-medium">
                    of {totalUsers.toLocaleString()}
                  </p>

                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full">
                    <span className="text-xs">{rankTier.emoji}</span>
                  </div>
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
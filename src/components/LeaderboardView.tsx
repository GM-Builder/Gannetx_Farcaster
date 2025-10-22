// src/components/LeaderboardView.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaUsers, FaTrophy, FaMedal, FaChevronDown } from 'react-icons/fa';
import { useLeaderboard } from '@/hooks/useSubgraph';
import { useTopReferrers } from '@/hooks/useReferral';
import { useUserRanking } from '@/hooks/useUserRangking';

interface LeaderboardViewProps {
  address: string | null;
}

type TabType = 'checkins' | 'referrals';

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ address }) => {
  const [activeTab, setActiveTab] = useState<TabType>('checkins');
  const [showFullCheckins, setShowFullCheckins] = useState(false);
  const [showFullReferrals, setShowFullReferrals] = useState(false);

  const { data: topCheckins, loading: checkinsLoading } = useLeaderboard();
  const { data: topReferrers, loading: referralsLoading } = useTopReferrers(50);
  const { data: userRanking } = useUserRanking(address);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (index === 1) return 'from-gray-300 via-gray-400 to-gray-500';
    if (index === 2) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-slate-600 to-slate-700';
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const displayCheckins = showFullCheckins ? topCheckins : topCheckins?.slice(0, 10);
  const displayReferrals = showFullReferrals ? topReferrers : topReferrers?.slice(0, 10);

  const userCheckinRank = topCheckins?.findIndex(
    entry => entry.address.toLowerCase() === address?.toLowerCase()
  );
  const userCheckinPosition = userCheckinRank !== undefined && userCheckinRank !== -1 
    ? userCheckinRank + 1 
    : null;

  const userReferralRank = topReferrers?.findIndex(
    ref => ref.id.toLowerCase() === address?.toLowerCase()
  );
  const userReferralPosition = userReferralRank !== undefined && userReferralRank !== -1 
    ? userReferralRank + 1 
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/40 to-pink-500/40">
            <FaTrophy className="text-2xl text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            <p className="text-sm text-gray-600 dark:text-slate-300">Top performers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('checkins')}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'checkins'
              ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-300'
              : 'bg-gray-200 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-600 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaFire />
            <span className="text-sm">Checkins</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'referrals'
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300'
              : 'bg-gray-200 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-600 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaUsers />
            <span className="text-sm">Referrals</span>
          </div>
        </button>
      </div>

      {/* Your Ranking */}
      {address && (
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-300 dark:border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <FaMedal className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">Your Rank</p>
                <code className="text-xs font-mono text-gray-800 dark:text-slate-300">
                  {address.substring(0, 10)}...
                </code>
              </div>
            </div>
            <div className="text-right">
              {activeTab === 'checkins' ? (
                <>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    #{userCheckinPosition || userRanking?.rank || '—'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    of {userRanking?.totalUsers || 0}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    #{userReferralPosition || '—'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    of {topReferrers?.length || 0}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkins Tab */}
      {activeTab === 'checkins' && (
        <div className="space-y-3">
          {checkinsLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800/30 rounded-xl">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayCheckins && displayCheckins.length > 0 ? (
            <>
              {displayCheckins.map((entry, index) => {
                const isCurrentUser = entry.address.toLowerCase() === address?.toLowerCase();
                const isTopThree = index < 3;
                
                return (
                  <motion.div
                    key={entry.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 border-2 border-orange-400 dark:border-orange-500/50'
                        : isTopThree
                          ? 'bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50'
                          : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center font-bold shadow-lg ${
                        isTopThree ? 'text-xl' : 'text-sm'
                      } text-white border-2 border-white/20`}>
                        {getMedalEmoji(index)}
                      </div>
                      <div>
                        <code className="text-sm font-mono text-gray-900 dark:text-slate-200 block font-semibold">
                          {isCurrentUser ? 'You' : `${entry.address.substring(0, 10)}...${entry.address.substring(38)}`}
                        </code>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            {entry.chains.length} chain{entry.chains.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            🔥 {entry.maxStreak} streak
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {entry.totalCheckins}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">GMs</p>
                    </div>
                  </motion.div>
                );
              })}
              
              {!showFullCheckins && topCheckins && topCheckins.length > 10 && (
                <button
                  onClick={() => setShowFullCheckins(true)}
                  className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700/50 rounded-xl font-medium text-gray-900 dark:text-slate-300 transition-all flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700/50"
                >
                  <span>Show More</span>
                  <FaChevronDown className="text-sm" />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800/50 flex items-center justify-center">
                <FaFire className="text-4xl text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 text-lg font-medium">No data available</p>
            </div>
          )}
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-3">
          {referralsLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800/30 rounded-xl">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayReferrals && displayReferrals.length > 0 ? (
            <>
              {displayReferrals.map((referrer, index) => {
                const isCurrentUser = referrer.id.toLowerCase() === address?.toLowerCase();
                const isTopThree = index < 3;
                
                return (
                  <motion.div
                    key={referrer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 border-2 border-cyan-400 dark:border-cyan-500/50'
                        : isTopThree
                          ? 'bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50'
                          : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center font-bold shadow-lg ${
                        isTopThree ? 'text-xl' : 'text-sm'
                      } text-white border-2 border-white/20`}>
                        {getMedalEmoji(index)}
                      </div>
                      <div>
                        <code className="text-sm font-mono text-gray-900 dark:text-slate-200 block font-semibold">
                          {isCurrentUser ? 'You' : `${referrer.id.substring(0, 10)}...${referrer.id.substring(38)}`}
                        </code>
                        {referrer.firstReferralTimestamp && (
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                            Since {new Date(referrer.firstReferralTimestamp * 1000).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {referrer.totalReferrals}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">referrals</p>
                    </div>
                  </motion.div>
                );
              })}
              
              {!showFullReferrals && topReferrers && topReferrers.length > 10 && (
                <button
                  onClick={() => setShowFullReferrals(true)}
                  className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700/50 rounded-xl font-medium text-gray-900 dark:text-slate-300 transition-all flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700/50"
                >
                  <span>Show More</span>
                  <FaChevronDown className="text-sm" />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800/50 flex items-center justify-center">
                <FaUsers className="text-4xl text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 text-lg font-medium">No referrers yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
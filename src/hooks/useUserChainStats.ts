// src/hooks/useUserChainStats.ts

import { useState, useEffect } from 'react';
import { getUserStatsOnChain } from '@/services/subgraphService';
import { chainIdToName, ChainName } from '@/utils/subgraph';

export function useUserChainStats(chainId: number | null, address: string | null) {
  const [data, setData] = useState<{
    totalCheckins: number;
    currentStreak: number;
    maxStreak: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chainId || !address) {
      setData(null);
      setLoading(false);
      return;
    }

    const chainName = chainIdToName(chainId);
    if (!chainName) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserStatsOnChain(chainName as ChainName, address)
      .then((result) => {
        if (result) {
          setData({
            totalCheckins: result.totalCheckins,
            currentStreak: result.currentStreak,
            maxStreak: result.maxStreak,
          });
        } else {
          setData({
            totalCheckins: 0,
            currentStreak: 0,
            maxStreak: 0,
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching user chain stats:', err);
        setError(err);
        setData({
          totalCheckins: 0,
          currentStreak: 0,
          maxStreak: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [chainId, address]);

  return { data, loading, error };
}
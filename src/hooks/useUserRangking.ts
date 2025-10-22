// src/hooks/useUserRanking.ts

import { useState, useEffect } from 'react';
import { getUserRankingAllChains } from '@/services/subgraphService';

export function useUserRanking(address: string | null | undefined) {
  const [data, setData] = useState<{
    rank: number;
    totalUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setData({ rank: 0, totalUsers: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserRankingAllChains(address)
      .then((result) => {
        if (result) {
          setData(result);
        } else {
          setData({ rank: 0, totalUsers: 0 });
        }
      })
      .catch((err) => {
        console.error('Error fetching user ranking:', err);
        setError(err);
        setData({ rank: 0, totalUsers: 0 });
      })
      .finally(() => setLoading(false));
  }, [address]);

  return { data, loading, error };
}
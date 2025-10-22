// src/hooks/useSubgraph.ts

import { useState, useEffect } from 'react';
import {
  getGlobalStatsAllChains,
  getTop10LeaderboardAllChains,
  getUserStatsAllChains,
  getUserCheckinsAllChains,
  getDailyStatsAllChains,
  getChainGlobalStats,
  getChainLeaderboard,
  GlobalStats,
  LeaderboardEntry,
  Navigator,
  UserCheckin,
  DailyStat,
} from '@/services/subgraphService';
import { ChainName } from '@/utils/subgraph';

// ========================================
// MULTI-CHAIN HOOKS
// ========================================

export function useGlobalStats() {
  const [data, setData] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getGlobalStatsAllChains()
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getTop10LeaderboardAllChains()
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    setLoading(true);
    getTop10LeaderboardAllChains()
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}

export function useUserStats(address: string | undefined) {
  const [data, setData] = useState<Navigator | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserStatsAllChains(address)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [address]);

  const refetch = () => {
    if (!address) return;
    
    setLoading(true);
    getUserStatsAllChains(address)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}

export function useUserCheckins(address: string | undefined, limit: number = 30) {
  const [data, setData] = useState<UserCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserCheckinsAllChains(address, limit)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [address, limit]);

  return { data, loading, error };
}

export function useDailyStats(days: number = 7) {
  const [data, setData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDailyStatsAllChains(days)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [days]);

  return { data, loading, error };
}

// ========================================
// SINGLE CHAIN HOOKS
// ========================================

export function useChainGlobalStats(chain: ChainName) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getChainGlobalStats(chain)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [chain]);

  return { data, loading, error };
}

export function useChainLeaderboard(chain: ChainName, limit: number = 10) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getChainLeaderboard(chain, limit)
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [chain, limit]);

  return { data, loading, error };
}

// ========================================
// POLLING HOOKS (Auto-refresh)
// ========================================

export function useGlobalStatsPolling(intervalMs: number = 30000) {
  const [data, setData] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = () => {
      getGlobalStatsAllChains()
        .then(setData)
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { data, loading, error };
}

export function useLeaderboardPolling(intervalMs: number = 60000) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = () => {
      getTop10LeaderboardAllChains()
        .then(setData)
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { data, loading, error };
}
// src/services/subgraphService.ts

import { createSubgraphClient } from '@/utils/apolloClient';
import {
  GET_GLOBAL_STATS,
  GET_LEADERBOARD,
  GET_USER_STATS,
  GET_USER_CHECKINS,
  GET_DAILY_STATS,
  GET_RECENT_CHECKINS,
} from '@/graphql/queries';
import { ChainName, SUPPORTED_CHAINS } from '@/utils/subgraph';
import { 
  RawDailyStatsResponse, 
  RawGlobalStatsResponse, 
  RawLeaderboardResponse, 
  RawUserStatsResponse, 
  RawNavigatorEntry,
  RawCheckin,
  RawUserCheckinsResponse,
  RawUserRankingResponse,
} from '@/types';

// Tipe hasil yang di-parse dari getUserStatsOnChain
export interface ChainNavigatorStats {
  chain: ChainName;
  address: string;
  totalCheckins: number;
  currentStreak: number;
  maxStreak: number;
  totalTaxPaid: number;
  firstBeaconTimestamp: number;
  lastBeaconTimestamp: number;
}

// Tipe data yang di-map dari Leaderboard entry raw
interface AggregationInput {
  chain: ChainName;
  address: string;
  totalCheckins: number;
  currentStreak: number;
  maxStreak: number;
  totalTaxPaid: number;
}

// Definisikan ulang tipe yang diperlukan dari types/index.ts (untuk referensi cepat)
export interface GlobalStats {
  totalNavigators: number;
  totalCheckins: number;
  totalTaxCollected: number;
  chains: Array<{
    chain: ChainName;
    totalNavigators: number;
    totalCheckins: number;
    totalTaxCollected: number;
  }>;
}

export interface Navigator {
  address: string;
  totalCheckins: number;
  currentStreak: number;
  maxStreak: number;
  totalTaxPaid: number;
  chains: ChainName[];
}

export interface LeaderboardEntry {
  address: string;
  totalCheckins: number;
  maxStreak: number;
  currentStreak: number;
  totalTaxPaid: number;
  chains: ChainName[];
}

export interface UserCheckin {
  id: string;
  sequence: number;
  timestamp: number;
  tribute: number;
  dayIndex: number;
  streak: number;
  txHash: string;
  chain: ChainName;
}

export interface DailyStat {
  dayIndex: number;
  beaconCount: number;
  taxCollected: number;
  uniqueNavigators: number;
  date: number;
}

// ========================================
// SINGLE CHAIN QUERIES
// ========================================

export async function getChainGlobalStats(chain: ChainName) {
  try {
    const client = createSubgraphClient(chain);
    const { data } = await client.query<RawGlobalStatsResponse>({
      query: GET_GLOBAL_STATS,
      fetchPolicy: 'network-only',
    });

    // 1. Perbaikan: Handle data undefined dari Apollo client
    if (!data || !data.globalStats) return null;

    return {
      chain,
      totalNavigators: parseInt(data.globalStats.totalNavigators || '0'),
      totalCheckins: parseInt(data.globalStats.totalCheckins || '0'),
      totalTaxCollected: parseFloat(data.globalStats.totalTaxCollected || '0'),
    };
  } catch (error) {
    console.error(`Error fetching stats for ${chain}:`, error);
    return null;
  }
}

export async function getChainLeaderboard(chain: ChainName, limit: number = 10): Promise<AggregationInput[]> {
  try {
    const client = createSubgraphClient(chain);
    const { data } = await client.query<RawLeaderboardResponse>({
      query: GET_LEADERBOARD,
      variables: { first: limit },
      fetchPolicy: 'network-only',
    });

    // 1. Perbaikan: Handle data undefined
    if (!data || !data.leaderboardEntries) return [];

    // 2. Perbaikan: Ganti 'any' dengan tipe eksplisit
    return data.leaderboardEntries.map((entry: { navigator: RawNavigatorEntry }) => ({
      chain,
      address: entry.navigator.address,
      totalCheckins: parseInt(entry.navigator.totalCheckins || '0'),
      currentStreak: parseInt(entry.navigator.currentStreak || '0'),
      maxStreak: parseInt(entry.navigator.maxStreak || '0'),
      totalTaxPaid: parseFloat(entry.navigator.totalTaxPaid || '0'),
    }));
  } catch (error) {
    console.error(`Error fetching leaderboard for ${chain}:`, error);
    return [];
  }
}

export async function getUserStatsOnChain(chain: ChainName, address: string): Promise<ChainNavigatorStats | null> {
  try {
    const client = createSubgraphClient(chain);
    const { data } = await client.query<RawUserStatsResponse>({
      query: GET_USER_STATS,
      variables: { address: address.toLowerCase() },
      fetchPolicy: 'network-only',
    });

    // 1. Perbaikan: Handle data undefined
    if (!data || !data.navigator) return null;

    // Karena data.navigator sudah dipastikan ada
    return {
      chain,
      address: data.navigator.address,
      totalCheckins: parseInt(data.navigator.totalCheckins || '0'),
      currentStreak: parseInt(data.navigator.currentStreak || '0'),
      maxStreak: parseInt(data.navigator.maxStreak || '0'),
      totalTaxPaid: parseFloat(data.navigator.totalTaxPaid || '0'),
      firstBeaconTimestamp: parseInt(data.navigator.firstBeaconTimestamp || '0'),
      lastBeaconTimestamp: parseInt(data.navigator.lastBeaconTimestamp || '0'),
    };
  } catch (error) {
    console.error(`Error fetching user stats for ${chain}:`, error);
    return null;
  }
}

export async function getUserCheckinsOnChain(
  chain: ChainName,
  address: string,
  limit: number = 30
): Promise<UserCheckin[]> {
  try {
    const client = createSubgraphClient(chain);
    const { data } = await client.query<RawUserCheckinsResponse>({ // Menggunakan tipe RawUserCheckinsResponse
      query: GET_USER_CHECKINS,
      variables: { address: address.toLowerCase(), first: limit },
      fetchPolicy: 'network-only',
    });

    // 1. Perbaikan: Handle data undefined
    if (!data || !data.navigator || !data.navigator.checkins) return [];

    // 2. Perbaikan: Ganti 'any' dengan tipe eksplisit
    return data.navigator.checkins.map((checkin: RawCheckin) => ({
      ...checkin,
      chain,
      id: checkin.id,
      sequence: parseInt(checkin.sequence),
      timestamp: parseInt(checkin.timestamp),
      dayIndex: parseInt(checkin.dayIndex),
      streak: parseInt(checkin.streak),
      tribute: parseFloat(checkin.tribute), // Konversi tribute ke number/float
    }));
  } catch (error) {
    console.error(`Error fetching user checkins for ${chain}:`, error);
    return [];
  }
}

export async function getChainDailyStats(chain: ChainName, days: number = 7): Promise<DailyStat[]> {
  try {
    const client = createSubgraphClient(chain);
    const { data } = await client.query<RawDailyStatsResponse>({
      query: GET_DAILY_STATS,
      variables: { days },
      fetchPolicy: 'network-only',
    });

    // 1. Perbaikan: Handle data undefined
    if (!data || !data.dailyStats) return [];

    // Tipe untuk item raw daily stat
    interface RawDailyStatItem {
        dayIndex: string;
        beaconCount: string;
        taxCollected: string;
        uniqueNavigators: string;
        date: string;
    }

    // 2. Perbaikan: Ganti 'any' dengan tipe eksplisit
    return data.dailyStats.map((stat: RawDailyStatItem) => ({
      chain,
      dayIndex: parseInt(stat.dayIndex),
      beaconCount: parseInt(stat.beaconCount),
      taxCollected: parseFloat(stat.taxCollected),
      uniqueNavigators: parseInt(stat.uniqueNavigators),
      date: parseInt(stat.date),
    }));
  } catch (error) {
    console.error(`Error fetching daily stats for ${chain}:`, error);
    return [];
  }
}

// ========================================
// MULTI-CHAIN AGGREGATION
// ========================================

export async function getGlobalStatsAllChains(): Promise<GlobalStats> {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => getChainGlobalStats(chain))
  );

  // Filter yang memastikan hanya hasil non-null yang tersisa.
  // TypeScript tahu bahwa array ini hanya berisi objek dari getChainGlobalStats, bukan null.
  const validResults = results.filter((r): r is Exclude<typeof r, null> => r !== null);

  return validResults.reduce(
    (acc, result) => {
      // Tidak perlu lagi if (result) karena validResults sudah difilter
      acc.totalNavigators += result.totalNavigators;
      acc.totalCheckins += result.totalCheckins;
      acc.totalTaxCollected += result.totalTaxCollected;
      // Perhatikan bahwa tipe result di sini sudah dijamin non-null
      acc.chains.push(result as {
        chain: ChainName;
        totalNavigators: number;
        totalCheckins: number;
        totalTaxCollected: number;
      });
      return acc;
    },
    {
      totalNavigators: 0,
      totalCheckins: 0,
      totalTaxCollected: 0,
      chains: [],
    } as GlobalStats
  );
}

export async function getTop10LeaderboardAllChains(): Promise<LeaderboardEntry[]> {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => getChainLeaderboard(chain, 100))
  );

  // Perbaikan: Assert results.flat() sebagai AggregationInput[]
  const allNavigators = results.flat() as AggregationInput[];

  // Aggregate by address
  const navigatorMap = new Map<string, LeaderboardEntry>();

  allNavigators.forEach((nav: AggregationInput) => { // Perbaikan: Ganti 'any' menjadi AggregationInput
    const key = nav.address.toLowerCase();

    if (navigatorMap.has(key)) {
      const existing = navigatorMap.get(key)!;
      existing.totalCheckins += nav.totalCheckins;
      existing.totalTaxPaid += nav.totalTaxPaid;
      existing.maxStreak = Math.max(existing.maxStreak, nav.maxStreak);
      existing.currentStreak = Math.max(existing.currentStreak, nav.currentStreak);
      // 'chains' adalah ChainName[], jadi kita pastikan nav.chain adalah ChainName
      if (!existing.chains.includes(nav.chain as ChainName)) { 
        existing.chains.push(nav.chain as ChainName);
      }
    } else {
      navigatorMap.set(key, {
        address: nav.address,
        totalCheckins: nav.totalCheckins,
        currentStreak: nav.currentStreak,
        maxStreak: nav.maxStreak,
        totalTaxPaid: nav.totalTaxPaid,
        chains: [nav.chain as ChainName],
      });
    }
  });

  // Convert to array and sort
  const aggregated = Array.from(navigatorMap.values());
  // Perbaikan: Tipe eksplisit pada sort callback
  aggregated.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalCheckins - a.totalCheckins);

  return aggregated.slice(0, 10);
}

export async function getUserStatsAllChains(address: string): Promise<Navigator | null> {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => getUserStatsOnChain(chain, address))
  );

  // 2. Perbaikan: Menggunakan Type Predicate untuk memfilter null
  const validResults = results.filter((r): r is ChainNavigatorStats => r !== null);

  if (validResults.length === 0) return null;

  const aggregated = validResults.reduce(
    (acc, result) => { // Tipe 'result' sekarang dijamin ChainNavigatorStats (non-null)
      // Tidak perlu lagi if (result) karena validResults sudah difilter
      acc.totalCheckins += result.totalCheckins;
      acc.totalTaxPaid += result.totalTaxPaid;
      acc.maxStreak = Math.max(acc.maxStreak, result.maxStreak);
      acc.currentStreak = Math.max(acc.currentStreak, result.currentStreak);
      acc.chains.push(result.chain);
      return acc;
    },
    {
      address,
      totalCheckins: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalTaxPaid: 0,
      chains: [],
    } as Navigator
  );

  return aggregated;
}

export async function getUserCheckinsAllChains(
  address: string,
  limit: number = 30
): Promise<UserCheckin[]> {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => getUserCheckinsOnChain(chain, address, limit))
  );

  const allCheckins = results.flat();

  // Sort by timestamp descending
  allCheckins.sort((a: UserCheckin, b: UserCheckin) => b.timestamp - a.timestamp); // Perbaikan: Tipe eksplisit

  return allCheckins.slice(0, limit);
}

export async function getDailyStatsAllChains(days: number = 7): Promise<DailyStat[]> {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => getChainDailyStats(chain, days))
  );

  return results.flat();
}

// ========================================
// USER RANKING
// ========================================

import { GET_USER_RANKING } from '@/graphql/queries';

export async function getUserRanking(chainName: ChainName, address: string): Promise<{
  rank: number;
  totalUsers: number;
} | null> {
  try {
    const client = createSubgraphClient(chainName);
    // ✅ PERBAIKAN 1: Tambahkan <RawUserRankingResponse>
    const { data } = await client.query<RawUserRankingResponse>({
      query: GET_USER_RANKING,
      variables: { address: address.toLowerCase() },
      fetchPolicy: 'network-only',
    });

    // ✅ PERBAIKAN 2: Handle data undefined dengan benar
    if (!data) {
      return { rank: 0, totalUsers: 0 };
    }

    // ✅ PERBAIKAN 3: Handle navigator null
    if (!data.navigator) {
      const totalUsers = parseInt(data.globalStats?.totalNavigators || '0');
      return { rank: 0, totalUsers };
    }

    const userCheckins = parseInt(data.navigator.totalCheckins || '0');
    const leaderboard = data.leaderboardEntries || [];
    
    let rank = 0;
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].navigator.address.toLowerCase() === address.toLowerCase()) {
        rank = i + 1;
        break;
      }
    }
    
    if (rank === 0 && userCheckins > 0) {
      // ✅ PERBAIKAN 4: Hapus type 'any', gunakan type inference
      const usersAbove = leaderboard.filter(
        (entry: { navigator: { totalCheckins: any; }; }) => parseInt(entry.navigator.totalCheckins || '0') > userCheckins
      ).length;
      rank = usersAbove + 1;
    }

    const totalUsers = parseInt(data.globalStats?.totalNavigators || '0');

    return { rank, totalUsers };
  } catch (error) {
    console.error(`Error fetching user ranking for ${chainName}:`, error);
    return null;
  }
}

export async function getUserRankingAllChains(address: string): Promise<{
  rank: number;
  totalUsers: number;
} | null> {
  try {
    const results = await Promise.all(
      SUPPORTED_CHAINS.map((chain) => getUserRanking(chain, address))
    );

    // ✅ PERBAIKAN: Gunakan type predicate untuk filter yang lebih aman
    const validResults = results.filter(
      (r): r is NonNullable<typeof r> => r !== null && r.rank > 0
    );
    
    if (validResults.length === 0) {
      return { rank: 0, totalUsers: 0 };
    }

    // ✅ Sekarang TypeScript tahu r tidak null, tidak perlu r!
    const bestRank = Math.min(...validResults.map(r => r.rank));
    const maxTotalUsers = Math.max(...validResults.map(r => r.totalUsers));

    return {
      rank: bestRank,
      totalUsers: maxTotalUsers,
    };
  } catch (error) {
    console.error('Error fetching user ranking across all chains:', error);
    return null;
  }
}
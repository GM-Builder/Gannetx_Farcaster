import { ethers } from "ethers";

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  isLoading: boolean;
  error: string | null;
  chainId: number | null;
}

export interface CheckinStats {
  timeUntilNextCheckin: number;
  lastCheckinTime?: number;
  totalCheckins?: number;
  canCheckin?: boolean;
}

export interface ChainConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  contractAddress: string;
  logo: string;
  status: string;
}

export interface NavigationEvent {
  tab: string;
  subtab?: string;
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: number;
  isVisible: boolean;
}

export interface AmbientSound {
  name: string;
  description: string;
  icon: string;
  frequency: number;
  type: OscillatorType;
}

export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ContractTransactionResponse {
  hash: string;
  wait: () => Promise<ethers.providers.TransactionReceipt>;
}

export interface NavigatorMetrics {
  lastBeacon: ethers.BigNumber;
  crystalCount: ethers.BigNumber;
  nextResetTime: ethers.BigNumber;
  canActivate: boolean;
  currentStreak: ethers.BigNumber;
  maxStreak: ethers.BigNumber;
  firstBeaconDay: ethers.BigNumber;
  totalDaysActive: ethers.BigNumber;
}


export interface RawCheckin {
    id: string;
    sequence: string;
    timestamp: string;
    tribute: string;
    dayIndex: string;
    streak: string;
    txHash: string;
    blockNumber: string;
}

export interface RawGlobalStatsResponse {
    globalStats: {
        totalNavigators: string; // Subgraph mengembalikan angka sebagai string
        totalCheckins: string;
        totalTaxCollected: string; // Eth value sebagai string
    } | null;
}

export interface RawNavigatorEntry {
    address: string;
    totalCheckins: string;
    currentStreak: string;
    maxStreak: string;
    totalTaxPaid: string; 
    firstBeaconTimestamp?: string;
    lastBeaconTimestamp?: string;
}

export interface RawNavigatorWithCheckins extends RawNavigatorEntry {
    id: string; // ID navigator adalah address
    checkins: RawCheckin[];
    firstBeaconDay?: string;
    lastBeaconDay?: string;
    isActive?: boolean;
}

// Digunakan untuk GET_USER_STATS (ketika tidak me-request checkin history)
export interface RawUserStatsResponse {
    navigator: RawNavigatorEntry | null; // Navigator tanpa array checkins
}

// Digunakan untuk GET_USER_CHECKINS
export interface RawUserCheckinsResponse {
    navigator: RawNavigatorWithCheckins | null;
}

// Digunakan untuk GET_LEADERBOARD response
export interface RawLeaderboardResponse {
    leaderboardEntries: {
        navigator: RawNavigatorEntry;
        // Properti lain dari LeaderboardEntry di Subgraph, misalnya:
        totalCheckins: string; 
        maxStreak: string;
        lastUpdated: string;
    }[];
}

// Digunakan untuk GET_DAILY_STATS response
export interface RawDailyStatsResponse {
    dailyStats: {
        dayIndex: string;
        beaconCount: string;
        taxCollected: string;
        uniqueNavigators: string;
        date: string;
    }[];
}


// 2. AGGREGATED & PROCESSED TYPES (Tipe yang sudah bersih, digunakan di Frontend)

export interface AggregatedChainStats {
  chain: string; // Gunakan string karena ChainName tidak didefinisikan di sini
  totalNavigators: number;
  totalCheckins: number;
  totalTaxCollected: number;
}

// Match GlobalStats di subgraphService.ts
export interface GlobalStats {
  totalNavigators: number;
  totalCheckins: number;
  totalTaxCollected: number;
  chains: AggregatedChainStats[];
}

// Match LeaderboardEntry di subgraphService.ts
export interface LeaderboardEntry {
  address: string;
  totalCheckins: number;
  currentStreak: number;
  maxStreak: number;
  totalTaxPaid: number;
  chains: string[]; // List of chain names where navigator is active
}

// Match UserCheckin di subgraphService.ts
export interface UserCheckin {
  id: string;
  sequence: number;
  timestamp: number;
  tribute: number; // Sudah diubah ke float/number
  dayIndex: number;
  streak: number;
  txHash: string;
  chain: string;
}

// Interface untuk GET_USER_RANKING response
export interface RawUserRankingResponse {
  navigator: {
    id: string;
    address: string;
    totalCheckins: string;
  } | null;
  leaderboardEntries: Array<{
    navigator: {
      id: string;
      address: string;
      totalCheckins: string;
    };
  }>;
  globalStats: {
    totalNavigators: string;
  } | null;
}

export type QuestType = 'speed-runner' | 'multi-chain' | 'social' | 'ultimate' | null;

export type WhitelistTier = 'FREE' | 'TIER_1' | 'TIER_2' | 'TIER_3' | 'NOT_QUALIFIED';

export interface UserQuestProgress {
  address: string;
  activeQuest: QuestType;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  completedAt: Date | null;
  whitelistPosition: number;
  tier: WhitelistTier;
  chainProgress?: {
    [chainName: string]: number;
  };
  referralCount?: number;
  currentStreak?: number;
}

export interface QuestStats {
  totalCompleted: number;
  freeSpotsRemaining: number;
  activeRacers: number;
  mintDate: Date;
}

// ============================================
// Add to src/types/index.ts
// ============================================

// ========================================
// RAW REFERRAL RESPONSE TYPES (from Subgraph)
// ========================================

export interface RawReferral {
  id: string;
  referred: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
}

export interface RawReferrerData {
  id: string;
  totalReferrals: string;
  firstReferralTimestamp: string | null;
  lastReferralTimestamp: string | null;
  referrals: RawReferral[];
}

export interface RawUserReferralData {
  id: string;
  referredBy: {
    id: string;
    totalReferrals: string;
  } | null;
  referredTimestamp: string | null;
  referralTransactionHash: string | null;
}

export interface RawReferralStats {
  id: string;
  totalReferrals: string;
  totalReferrers: string;
  totalReferred: string;
  lastUpdatedTimestamp: string;
}

// ========================================
// QUERY RESPONSE TYPES
// ========================================

export interface RawReferrerInfoResponse {
  referrer: RawReferrerData | null;
}

export interface RawUserReferrerResponse {
  user: RawUserReferralData | null;
}

export interface RawTopReferrersResponse {
  referrers: Array<{
    id: string;
    totalReferrals: string;
    firstReferralTimestamp: string | null;
    lastReferralTimestamp: string | null;
  }>;
}

export interface RawReferralStatsResponse {
  referralStats: RawReferralStats | null;
}

export interface RawAllReferralsResponse {
  referrals: Array<{
    id: string;
    referrer: {
      id: string;
      totalReferrals: string;
    };
    referred: string;
    timestamp: string;
    transactionHash: string;
    blockNumber: string;
  }>;
}

export interface RawRecentReferralsResponse {
  referrals: Array<{
    id: string;
    referrer: {
      id: string;
    };
    referred: string;
    timestamp: string;
    transactionHash: string;
  }>;
}

// ========================================
// PROCESSED REFERRAL TYPES (for Frontend)
// ========================================

export interface Referral {
  id: string;
  referred: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface ReferrerData {
  id: string;
  totalReferrals: number;
  firstReferralTimestamp: number | null;
  lastReferralTimestamp: number | null;
  referrals: Referral[];
}

export interface UserReferralData {
  id: string;
  referredBy: {
    id: string;
    totalReferrals: number;
  } | null;
  referredTimestamp: number | null;
  referralTransactionHash: string | null;
}

export interface TopReferrer {
  id: string;
  totalReferrals: number;
  firstReferralTimestamp: number | null;
  lastReferralTimestamp: number | null;
}

export interface ReferralStats {
  totalReferrals: number;
  totalReferrers: number;
  totalReferred: number;
  lastUpdatedTimestamp: number;
}

export interface RecentReferral {
  id: string;
  referrer: {
    id: string;
  };
  referred: string;
  timestamp: number;
  transactionHash: string;
}
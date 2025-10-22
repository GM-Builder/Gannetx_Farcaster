// src/services/questService.ts
import { 
  getUserStatsAllChains, 
  getUserCheckinsAllChains 
} from './subgraphService';
import { ChainName, SUPPORTED_CHAINS } from '@/utils/subgraph';
import { 
  UserQuestProgress, 
  QuestType, 
  WhitelistTier,
  QuestStats 
} from '@/types';

// Quest requirements configuration
const QUEST_REQUIREMENTS = {
  'speed-runner': {
    type: 'single-chain',
    requiredCheckins: 10,
    totalSteps: 10
  },
  'multi-chain': {
    type: 'multi-chain',
    requiredCheckinsPerChain: 5,
    requiredChains: SUPPORTED_CHAINS.length,
    totalSteps: SUPPORTED_CHAINS.length * 5
  },
  'social': {
    type: 'social',
    requiredStreak: 7,
    requiredReferrals: 5,
    requiredCheckinsPerReferral: 3,
    totalSteps: 7 + 5 // streak days + referrals
  },
  'ultimate': {
    type: 'ultimate',
    requiredTotalCheckins: 50,
    requiredStreak: 30,
    requiredReferrals: 10,
    requiredChains: SUPPORTED_CHAINS.length,
    totalSteps: 50
  }
};

// Whitelist tier configuration
const WHITELIST_TIERS = {
  FREE: { min: 1, max: 1000, price: 0 },
  TIER_1: { min: 1001, max: 3000, price: 1 },
  TIER_2: { min: 3001, max: 8000, price: 3 },
  TIER_3: { min: 8001, max: 10000, price: 5 },
};

/**
 * Calculate user's quest progress based on their stats
 */
export async function calculateQuestProgress(
  address: string,
  questType: QuestType
): Promise<UserQuestProgress['progress']> {
  if (!questType) {
    return { current: 0, total: 0, percentage: 0 };
  }

  const userStats = await getUserStatsAllChains(address);
  if (!userStats) {
    return { current: 0, total: 0, percentage: 0 };
  }

  const requirements = QUEST_REQUIREMENTS[questType];
  let current = 0;
  let total = requirements.totalSteps;

  switch (questType) {
    case 'speed-runner': {
      // Check if user has 10+ checkins on any single chain
      // We need to check individual chain stats
      const chainStats = await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          const { getUserStatsOnChain } = await import('./subgraphService');
          return getUserStatsOnChain(chain, address);
        })
      );
      
      const maxCheckinsOnSingleChain = Math.max(
        ...chainStats
          .filter(stat => stat !== null)
          .map(stat => stat!.totalCheckins)
      );
      
      current = Math.min(maxCheckinsOnSingleChain, 10);
      break;
    }

    case 'multi-chain': {
      // Check checkins across all chains
      const chainStats = await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          const { getUserStatsOnChain } = await import('./subgraphService');
          return getUserStatsOnChain(chain, address);
        })
      );
      
      // Count chains with 5+ checkins
      current = chainStats.filter(
        stat => stat !== null && stat.totalCheckins >= 5
      ).length * 5;
      
      break;
    }

    case 'social': {
      // This requires additional data (referrals) that we don't have in subgraph
      // For now, use streak as primary indicator
      current = Math.min(userStats.currentStreak, 7);
      // TODO: Add referral tracking
      break;
    }

    case 'ultimate': {
      // Multiple requirements
      current = Math.min(userStats.totalCheckins, 50);
      break;
    }

    default:
      current = 0;
  }

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return { current, total, percentage };
}

/**
 * Determine whitelist tier based on position
 */
export function getWhitelistTier(position: number): WhitelistTier {
  if (position <= WHITELIST_TIERS.FREE.max) return 'FREE';
  if (position <= WHITELIST_TIERS.TIER_1.max) return 'TIER_1';
  if (position <= WHITELIST_TIERS.TIER_2.max) return 'TIER_2';
  if (position <= WHITELIST_TIERS.TIER_3.max) return 'TIER_3';
  return 'NOT_QUALIFIED';
}

/**
 * Calculate user's whitelist position
 * This is a simplified version - you'll need proper backend for FCFS tracking
 */
export async function calculateWhitelistPosition(
  address: string,
  questType: QuestType
): Promise<number> {
  // TODO: Replace with actual backend call
  // For now, use a mock calculation based on total checkins
  const userStats = await getUserStatsAllChains(address);
  if (!userStats) return 0;

  // Mock position calculation (higher checkins = better position)
  // In production, this should be based on quest completion timestamp
  const mockPosition = Math.max(1, 1000 - (userStats.totalCheckins * 10));
  
  return mockPosition;
}

/**
 * Get user's complete quest progress
 */
export async function getUserQuestProgress(
  address: string,
  activeQuest: QuestType = null
): Promise<UserQuestProgress> {
  // Get user stats from subgraph
  const userStats = await getUserStatsAllChains(address);
  
  if (!userStats) {
    return {
      address,
      activeQuest: null,
      progress: { current: 0, total: 0, percentage: 0 },
      completedAt: null,
      whitelistPosition: 0,
      tier: 'NOT_QUALIFIED',
    };
  }

  // Calculate progress based on active quest
  const progress = await calculateQuestProgress(address, activeQuest);
  
  // Calculate whitelist position
  const position = await calculateWhitelistPosition(address, activeQuest);
  
  // Determine tier
  const tier = getWhitelistTier(position);

  // Check if quest is completed
  const isCompleted = progress.percentage >= 100;
  const completedAt = isCompleted ? new Date() : null; // TODO: Store actual completion time

  return {
    address,
    activeQuest,
    progress,
    completedAt,
    whitelistPosition: position,
    tier,
    currentStreak: userStats.currentStreak,
  };
}

/**
 * Get global quest statistics
 */
export async function getQuestStats(): Promise<QuestStats> {
  // TODO: Replace with actual backend data
  // These should be fetched from your backend database
  
  return {
    totalCompleted: 1234, // Mock data
    freeSpotsRemaining: 766,
    activeRacers: 2847,
    mintDate: new Date('2024-12-15'), // Set your actual mint date
  };
}

/**
 * Get detailed chain progress for multi-chain quest
 */
export async function getChainProgress(address: string): Promise<Record<string, number>> {
  const chainProgress: Record<string, number> = {};
  
  await Promise.all(
    SUPPORTED_CHAINS.map(async (chain) => {
      const { getUserStatsOnChain } = await import('./subgraphService');
      const stats = await getUserStatsOnChain(chain, address);
      chainProgress[chain] = stats?.totalCheckins || 0;
    })
  );
  
  return chainProgress;
}
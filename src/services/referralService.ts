import { referralClient } from '@/utils/apolloClient';
import { 
  GET_REFERRER_INFO, 
  GET_USER_REFERRER, 
  GET_TOP_REFERRERS,
  GET_REFERRAL_STATS,
  GET_RECENT_REFERRALS
} from '@/graphql/referralQueries';
import {
  RawReferrerInfoResponse,
  RawUserReferrerResponse,
  RawTopReferrersResponse,
  RawReferralStatsResponse,
  RawRecentReferralsResponse,
  ReferrerData,
  UserReferralData,
  TopReferrer,
  ReferralStats,
  RecentReferral,
  Referral
} from '@/types';


export async function getReferrerInfo(address: string): Promise<ReferrerData | null> {
  try {
    const { data } = await referralClient.query<RawReferrerInfoResponse>({
      query: GET_REFERRER_INFO,
      variables: { address: address.toLowerCase() },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.referrer) return null;

    return {
      id: data.referrer.id,
      totalReferrals: parseInt(data.referrer.totalReferrals || '0'),
      firstReferralTimestamp: data.referrer.firstReferralTimestamp 
        ? parseInt(data.referrer.firstReferralTimestamp) 
        : null,
      lastReferralTimestamp: data.referrer.lastReferralTimestamp 
        ? parseInt(data.referrer.lastReferralTimestamp) 
        : null,
      referrals: data.referrer.referrals.map((ref) => ({
        id: ref.id,
        referred: ref.referred,
        timestamp: parseInt(ref.timestamp),
        transactionHash: ref.transactionHash,
        blockNumber: parseInt(ref.blockNumber),
      })),
    };
  } catch (error) {
    console.error('Error fetching referrer info:', error);
    return null;
  }
}

export async function getUserReferrer(address: string): Promise<UserReferralData | null> {
  try {
    const { data } = await referralClient.query<RawUserReferrerResponse>({
      query: GET_USER_REFERRER,
      variables: { address: address.toLowerCase() },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.user) {
      return {
        id: address.toLowerCase(),
        referredBy: null,
        referredTimestamp: null,
        referralTransactionHash: null,
      };
    }

    return {
      id: data.user.id,
      referredBy: data.user.referredBy ? {
        id: data.user.referredBy.id,
        totalReferrals: parseInt(data.user.referredBy.totalReferrals || '0'),
      } : null,
      referredTimestamp: data.user.referredTimestamp 
        ? parseInt(data.user.referredTimestamp) 
        : null,
      referralTransactionHash: data.user.referralTransactionHash,
    };
  } catch (error) {
    console.error('Error fetching user referrer:', error);
    return null;
  }
}

export async function getTopReferrers(limit: number = 10): Promise<TopReferrer[]> {
  try {
    const { data } = await referralClient.query<RawTopReferrersResponse>({
      query: GET_TOP_REFERRERS,
      variables: { first: limit },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.referrers) return [];

    return data.referrers.map((ref) => ({
      id: ref.id,
      totalReferrals: parseInt(ref.totalReferrals || '0'),
      firstReferralTimestamp: ref.firstReferralTimestamp 
        ? parseInt(ref.firstReferralTimestamp) 
        : null,
      lastReferralTimestamp: ref.lastReferralTimestamp 
        ? parseInt(ref.lastReferralTimestamp) 
        : null,
    }));
  } catch (error) {
    console.error('Error fetching top referrers:', error);
    return [];
  }
}

export async function getReferralStats(): Promise<ReferralStats | null> {
  try {
    const { data } = await referralClient.query<RawReferralStatsResponse>({
      query: GET_REFERRAL_STATS,
      fetchPolicy: 'network-only',
    });

    if (!data || !data.referralStats) return null;

    return {
      totalReferrals: parseInt(data.referralStats.totalReferrals || '0'),
      totalReferrers: parseInt(data.referralStats.totalReferrers || '0'),
      totalReferred: parseInt(data.referralStats.totalReferred || '0'),
      lastUpdatedTimestamp: parseInt(data.referralStats.lastUpdatedTimestamp || '0'),
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }
}

export async function getRecentReferrals(limit: number = 20): Promise<RecentReferral[]> {
  try {
    const { data } = await referralClient.query<RawRecentReferralsResponse>({
      query: GET_RECENT_REFERRALS,
      variables: { limit },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.referrals) return [];

    return data.referrals.map((ref) => ({
      id: ref.id,
      referrer: {
        id: ref.referrer.id,
      },
      referred: ref.referred,
      timestamp: parseInt(ref.timestamp),
      transactionHash: ref.transactionHash,
    }));
  } catch (error) {
    console.error('Error fetching recent referrals:', error);
    return [];
  }
}

export type {
  ReferrerData,
  UserReferralData,
  TopReferrer,
  ReferralStats,
  RecentReferral,
  Referral
};
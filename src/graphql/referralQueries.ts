import { gql } from '@apollo/client';

// Query 1: Get Referrer Info & All Referrals
export const GET_REFERRER_INFO = gql`
  query GetReferrerInfo($address: String!) {
    referrer(id: $address) {
      id
      totalReferrals
      firstReferralTimestamp
      lastReferralTimestamp
      referrals(orderBy: timestamp, orderDirection: desc) {
        id
        referred
        timestamp
        transactionHash
        blockNumber
      }
    }
  }
`;

// Query 2: Get User's Referrer (Who invited me?)
export const GET_USER_REFERRER = gql`
  query GetUserReferrer($address: String!) {
    user(id: $address) {
      id
      referredBy {
        id
        totalReferrals
      }
      referredTimestamp
      referralTransactionHash
    }
  }
`;

// Query 3: Get Top Referrers (Leaderboard)
export const GET_TOP_REFERRERS = gql`
  query GetTopReferrers($first: Int = 10, $skip: Int = 0) {
    referrers(
      first: $first
      skip: $skip
      orderBy: totalReferrals
      orderDirection: desc
    ) {
      id
      totalReferrals
      firstReferralTimestamp
      lastReferralTimestamp
    }
  }
`;

// Query 4: Get All Referrals (Paginated)
export const GET_ALL_REFERRALS = gql`
  query GetAllReferrals($first: Int = 100, $skip: Int = 0) {
    referrals(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      referrer {
        id
        totalReferrals
      }
      referred
      timestamp
      transactionHash
      blockNumber
    }
  }
`;

// Query 5: Get Global Stats
export const GET_REFERRAL_STATS = gql`
  query GetReferralStats {
    referralStats(id: "global") {
      id
      totalReferrals
      totalReferrers
      totalReferred
      lastUpdatedTimestamp
    }
  }
`;

// Query 6: Get Recent Referrals
export const GET_RECENT_REFERRALS = gql`
  query GetRecentReferrals($limit: Int = 20) {
    referrals(
      first: $limit
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      referrer {
        id
      }
      referred
      timestamp
      transactionHash
    }
  }
`;
// src/graphql/queries.ts

import { gql } from '@apollo/client';

// Query for global statistics
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(id: "global") {
      totalNavigators
      totalCheckins
      totalTaxCollected
      maxDailyBeacons
      maxDailyBeaconsDay
      contractDeployDay
      lastUpdatedTimestamp
    }
  }
`;

// Query for leaderboard
export const GET_LEADERBOARD = gql`
  query GetLeaderboard($first: Int!) {
    leaderboardEntries(
      first: $first
      orderBy: totalCheckins
      orderDirection: desc
    ) {
      navigator {
        id
        address
        totalCheckins
        currentStreak
        maxStreak
        totalTaxPaid
        firstBeaconTimestamp
        lastBeaconTimestamp
      }
      totalCheckins
      maxStreak
      lastUpdated
    }
  }
`;

// Query for specific user stats
export const GET_USER_STATS = gql`
  query GetUserStats($address: ID!) {
    navigator(id: $address) {
      id
      address
      totalCheckins
      currentStreak
      maxStreak
      totalTaxPaid
      firstBeaconDay
      lastBeaconDay
      firstBeaconTimestamp
      lastBeaconTimestamp
      isActive
    }
  }
`;

// Query for user checkin history
export const GET_USER_CHECKINS = gql`
  query GetUserCheckins($address: ID!, $first: Int!) {
    navigator(id: $address) {
      id
      address
      totalCheckins
      checkins(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        sequence
        timestamp
        tribute
        dayIndex
        streak
        txHash
        blockNumber
      }
    }
  }
`;

// Query for daily statistics
export const GET_DAILY_STATS = gql`
  query GetDailyStats($days: Int!) {
    dailyStats(first: $days, orderBy: dayIndex, orderDirection: desc) {
      id
      dayIndex
      beaconCount
      taxCollected
      uniqueNavigators
      date
    }
  }
`;

// Query for specific day stats
export const GET_DAY_STATS = gql`
  query GetDayStats($dayIndex: ID!) {
    dailyStats(id: $dayIndex) {
      dayIndex
      beaconCount
      taxCollected
      uniqueNavigators
      navigators
      date
    }
  }
`;

// Query for recent checkins
export const GET_RECENT_CHECKINS = gql`
  query GetRecentCheckins($first: Int!) {
    checkins(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      navigator {
        address
        totalCheckins
      }
      sequence
      timestamp
      tribute
      dayIndex
      streak
      txHash
      blockNumber
    }
  }
`;

// Query for streak milestones
export const GET_STREAK_MILESTONES = gql`
  query GetStreakMilestones($first: Int!) {
    streakMilestones(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      navigator {
        address
        totalCheckins
      }
      streakCount
      timestamp
      dayIndex
      txHash
    }
  }
`;

// Query for system config
export const GET_SYSTEM_CONFIG = gql`
  query GetSystemConfig {
    systemConfig(id: "config") {
      vaultKeeper
      treasuryVault
      channelTax
      circuitBreaker
      emergencyMode
      lastUpdatedTimestamp
    }
  }
`;

// Query for user ranking - NEW
export const GET_USER_RANKING = gql`
  query GetUserRanking($address: ID!) {
    navigator(id: $address) {
      id
      address
      totalCheckins
    }
    leaderboardEntries(
      first: 1000
      orderBy: totalCheckins
      orderDirection: desc
    ) {
      navigator {
        id
        address
        totalCheckins
      }
    }
    globalStats(id: "global") {
      totalNavigators
    }
  }
`;
import { WaterLocation } from '../types/WaterLocation';

/**
 * Configuration for the location color determination algorithm
 */
export interface ColorAlgorithmConfig {
  // Percentage of recent votes to consider for trend detection (0-1)
  recentVotesPercentage: number;

  // Minimum number of recent votes needed to detect a trend
  minRecentVotesForTrend: number;

  // Threshold for overwhelming positive (e.g., 0.75 = 75% positive)
  overwhelmingPositiveThreshold: number;

  // Threshold for overwhelming negative (e.g., 0.25 = 25% positive)
  overwhelmingNegativeThreshold: number;

  // Minimum total votes to make a confident determination
  minVotesForConfidence: number;

  // Threshold for trend reversal detection (difference in percentages)
  trendReversalThreshold: number;

  // Weight given to recent votes vs historical (0-1, higher = more weight to recent)
  recentVotesWeight: number;
}

/**
 * Default configuration - easily adjustable based on user testing
 */
export const DEFAULT_COLOR_CONFIG: ColorAlgorithmConfig = {
  recentVotesPercentage: 0.25, // Last 25% of votes
  minRecentVotesForTrend: 3, // Need at least 3 recent votes
  overwhelmingPositiveThreshold: 0.7, // 70%+ positive = green
  overwhelmingNegativeThreshold: 0.3, // 30%- positive = red
  minVotesForConfidence: 5, // Need at least 5 votes for confident color
  trendReversalThreshold: 0.35, // 35% difference indicates trend reversal
  recentVotesWeight: 0.6, // Recent votes have 60% weight
};

export enum LocationColor {
  GREEN = 'green', // Water available
  RED = 'red', // Water not available
  YELLOW = 'yellow', // Uncertain or trend changing
  GRAY = 'gray', // No votes yet
}

export interface ColorDetermination {
  color: LocationColor;
  reason: string;
  positiveRatio: number;
  recentPositiveRatio: number | null;
  hasTrendReversal: boolean;
}

/**
 * Determine the color of a location marker based on votes
 */
export function determineLocationColor(
  location: WaterLocation,
  config: ColorAlgorithmConfig = DEFAULT_COLOR_CONFIG
): ColorDetermination {
  const totalVotes = location.positiveFeedback + location.negativeFeedback;

  // Gray if no votes
  if (totalVotes === 0) {
    return {
      color: LocationColor.GRAY,
      reason: 'No votes yet',
      positiveRatio: 0,
      recentPositiveRatio: null,
      hasTrendReversal: false,
    };
  }

  // Calculate overall positive ratio
  const positiveRatio = location.positiveFeedback / totalVotes;

  // Yellow if not enough votes for confidence
  if (totalVotes < config.minVotesForConfidence) {
    return {
      color: LocationColor.YELLOW,
      reason: `Not enough votes for confidence (${totalVotes} < ${config.minVotesForConfidence})`,
      positiveRatio,
      recentPositiveRatio: null,
      hasTrendReversal: false,
    };
  }

  // Calculate recent votes ratio if we have vote history
  let recentPositiveRatio: number | null = null;
  let hasTrendReversal = false;

  if (location.voteHistory && location.voteHistory.length > 0) {
    const recentVoteCount = Math.max(
      Math.ceil(location.voteHistory.length * config.recentVotesPercentage),
      config.minRecentVotesForTrend
    );

    if (location.voteHistory.length >= config.minRecentVotesForTrend) {
      const recentVotes = location.voteHistory.slice(-recentVoteCount);
      const recentPositive = recentVotes.filter(
        (v: { isAvailable: boolean }) => v.isAvailable
      ).length;
      recentPositiveRatio = recentPositive / recentVotes.length;

      // Detect trend reversal
      const ratioDifference = Math.abs(recentPositiveRatio - positiveRatio);
      if (ratioDifference >= config.trendReversalThreshold) {
        hasTrendReversal = true;

        // If trend is reversing, mark as yellow
        return {
          color: LocationColor.YELLOW,
          reason: `Trend reversal detected: overall ${(positiveRatio * 100).toFixed(0)}% positive, recent ${(recentPositiveRatio * 100).toFixed(0)}% positive`,
          positiveRatio,
          recentPositiveRatio,
          hasTrendReversal: true,
        };
      }
    }
  }

  // Calculate weighted ratio if we have recent data
  let effectiveRatio = positiveRatio;
  if (recentPositiveRatio !== null) {
    effectiveRatio =
      positiveRatio * (1 - config.recentVotesWeight) +
      recentPositiveRatio * config.recentVotesWeight;
  }

  // Determine color based on effective ratio
  if (effectiveRatio >= config.overwhelmingPositiveThreshold) {
    return {
      color: LocationColor.GREEN,
      reason: `Overwhelmingly positive: ${(effectiveRatio * 100).toFixed(0)}% positive`,
      positiveRatio,
      recentPositiveRatio,
      hasTrendReversal,
    };
  } else if (effectiveRatio <= config.overwhelmingNegativeThreshold) {
    return {
      color: LocationColor.RED,
      reason: `Overwhelmingly negative: ${(effectiveRatio * 100).toFixed(0)}% positive`,
      positiveRatio,
      recentPositiveRatio,
      hasTrendReversal,
    };
  } else {
    return {
      color: LocationColor.YELLOW,
      reason: `Mixed reviews: ${(effectiveRatio * 100).toFixed(0)}% positive`,
      positiveRatio,
      recentPositiveRatio,
      hasTrendReversal,
    };
  }
}

/**
 * Get the hex color code for a location color
 */
export function getColorHex(color: LocationColor): string {
  switch (color) {
    case LocationColor.GREEN:
      return '#4caf50'; // Green
    case LocationColor.RED:
      return '#f44336'; // Red
    case LocationColor.YELLOW:
      return '#ffc107'; // Yellow/Amber
    case LocationColor.GRAY:
      return '#9e9e9e'; // Gray
    default:
      return '#9e9e9e';
  }
}

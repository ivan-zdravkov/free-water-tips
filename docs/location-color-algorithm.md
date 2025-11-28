# Location Color Algorithm Configuration

This document explains how to configure the location marker color algorithm based on user testing results.

## Algorithm Overview

The system determines marker colors (green/red/yellow/gray) based on vote patterns using a configurable algorithm in `/app/src/utils/locationColorAlgorithm.ts`.

## Configuration Parameters

Edit the `DEFAULT_COLOR_CONFIG` object in `locationColorAlgorithm.ts`:

### `recentVotesPercentage` (default: 0.25)

- **Range**: 0-1 (0% to 100%)
- **Purpose**: Percentage of most recent votes to consider for trend detection
- **Example**: 0.25 = last 25% of votes are considered "recent"
- **Impact**: Higher value = more votes considered recent, more sensitive to trends

### `minRecentVotesForTrend` (default: 3)

- **Range**: Any positive integer
- **Purpose**: Minimum number of recent votes needed to detect a trend reversal
- **Example**: Need at least 3 recent votes before checking for trend changes
- **Impact**: Higher value = stricter requirement for trend detection

### `overwhelmingPositiveThreshold` (default: 0.70)

- **Range**: 0-1 (0% to 100%)
- **Purpose**: Threshold for marking location as GREEN (water available)
- **Example**: 0.70 = 70%+ positive votes = green marker
- **Impact**: Lower value = easier to get green, higher = stricter

### `overwhelmingNegativeThreshold` (default: 0.30)

- **Range**: 0-1 (0% to 100%)
- **Purpose**: Threshold for marking location as RED (water not available)
- **Example**: 0.30 = 30% or less positive votes = red marker
- **Impact**: Higher value = easier to get red, lower = stricter

### `minVotesForConfidence` (default: 5)

- **Range**: Any positive integer
- **Purpose**: Minimum total votes before making confident color determination
- **Example**: Locations with < 5 votes show as YELLOW (uncertain)
- **Impact**: Higher value = more votes needed before showing green/red

### `trendReversalThreshold` (default: 0.35)

- **Range**: 0-1 (0% to 100%)
- **Purpose**: Percentage difference between recent and overall votes to detect trend reversal
- **Example**: 0.35 = If recent votes differ by 35%+ from overall, mark as YELLOW
- **Impact**: Lower value = more sensitive to trend changes

### `recentVotesWeight` (default: 0.6)

- **Range**: 0-1 (0% to 100%)
- **Purpose**: How much weight to give recent votes vs historical votes
- **Example**: 0.6 = 60% weight to recent, 40% to historical
- **Impact**: Higher value = recent votes matter more

## Color Logic Flow

1. **GRAY**: No votes yet
2. **YELLOW**: Less than `minVotesForConfidence` votes
3. **YELLOW**: Trend reversal detected (recent votes differ by `trendReversalThreshold`)
4. **GREEN**: Effective positive ratio >= `overwhelmingPositiveThreshold`
5. **RED**: Effective positive ratio <= `overwhelmingNegativeThreshold`
6. **YELLOW**: Everything else (mixed reviews)

## Testing Scenarios

### Scenario 1: Make system more sensitive to recent changes

```typescript
recentVotesPercentage: 0.30,     // Consider last 30% of votes
recentVotesWeight: 0.75,          // Give 75% weight to recent votes
trendReversalThreshold: 0.25,    // Detect trend at 25% difference
```

### Scenario 2: Be more conservative (require more votes)

```typescript
minVotesForConfidence: 10,        // Need 10 votes minimum
overwhelmingPositiveThreshold: 0.80,  // 80% for green
overwhelmingNegativeThreshold: 0.20,  // 20% for red
```

### Scenario 3: Quick to update (responsive to changes)

```typescript
recentVotesPercentage: 0.40,      // Last 40% are "recent"
minRecentVotesForTrend: 2,        // Only need 2 recent votes
recentVotesWeight: 0.80,          // 80% weight to recent
```

### Scenario 4: Stable markers (ignore noise)

```typescript
recentVotesPercentage: 0.15,      // Only last 15% recent
minRecentVotesForTrend: 5,        // Need 5 votes for trend
recentVotesWeight: 0.40,          // Only 40% weight to recent
trendReversalThreshold: 0.50,    // Large difference needed
```

## Current Test Data

The seed data in `/api/src/db/InMemoryStorage.ts` includes:

1. **loc-1** (Fountain): 45 positive, 3 negative → GREEN
2. **loc-2** (Restaurant): 5 positive, 25 negative → RED
3. **loc-3** (Dispenser): 32 positive, 28 negative, trend changed → YELLOW
4. **loc-4** (Cafe): 18 positive, 14 negative, mixed → YELLOW
5. **loc-5** (Library): 2 positive, 0 negative → GRAY (not enough votes)
6. **loc-6** (Park): 80 positive, 5 negative → GREEN

## Vote History Graph

The vote history graph automatically adjusts:

- **Time buckets**: Daily, every 2 days, weekly, or monthly based on data span
- **Display**: Shows positive (blue) and negative (red) vote bars over time
- **Steam-style**: Similar to Steam's review system with percentage and trend visualization

## Usage in Code

```typescript
import {
  determineLocationColor,
  DEFAULT_COLOR_CONFIG,
  LocationColor,
} from '../utils/locationColorAlgorithm';

// Use default config
const result = determineLocationColor(location);

// Or create custom config for A/B testing
const customConfig = {
  ...DEFAULT_COLOR_CONFIG,
  overwhelmingPositiveThreshold: 0.8,
  minVotesForConfidence: 10,
};
const result = determineLocationColor(location, customConfig);

// Result contains:
// - color: LocationColor enum (GREEN/RED/YELLOW/GRAY)
// - reason: Human-readable explanation
// - positiveRatio: Overall positive percentage
// - recentPositiveRatio: Recent votes percentage
// - hasTrendReversal: Boolean flag
```

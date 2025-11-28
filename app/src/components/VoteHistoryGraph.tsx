import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VoteHistoryItem } from '../types/WaterLocation';

interface VoteHistoryGraphProps {
  voteHistory: VoteHistoryItem[];
  width?: number;
  height?: number;
}

interface TimeFrame {
  label: string;
  days: number;
}

/**
 * Vote history graph similar to Steam's review system
 */
export function VoteHistoryGraph({
  voteHistory,
  width = 300,
  height = 150,
}: VoteHistoryGraphProps) {
  const graphData = useMemo(() => {
    if (!voteHistory || voteHistory.length === 0) {
      return null;
    }

    // Determine time frame based on vote span
    const now = new Date();
    const oldestVote = new Date(voteHistory[0].timestamp);
    const daySpan = Math.ceil((now.getTime() - oldestVote.getTime()) / (1000 * 60 * 60 * 24));

    // Select appropriate time frame
    let bucketDays: number;
    let timeFrameLabel: string;
    if (daySpan <= 7) {
      bucketDays = 1;
      timeFrameLabel = 'Daily';
    } else if (daySpan <= 30) {
      bucketDays = 2;
      timeFrameLabel = 'Every 2 days';
    } else if (daySpan <= 90) {
      bucketDays = 7;
      timeFrameLabel = 'Weekly';
    } else {
      bucketDays = 30;
      timeFrameLabel = 'Monthly';
    }

    // Group votes into buckets
    const buckets: Array<{ positive: number; negative: number; timestamp: Date }> = [];
    const bucketMap: Map<string, { positive: number; negative: number; timestamp: Date }> =
      new Map();

    voteHistory.forEach(vote => {
      const voteDate = new Date(vote.timestamp);
      const bucketKey = Math.floor(
        voteDate.getTime() / (bucketDays * 24 * 60 * 60 * 1000)
      ).toString();

      if (!bucketMap.has(bucketKey)) {
        bucketMap.set(bucketKey, {
          positive: 0,
          negative: 0,
          timestamp: new Date(parseInt(bucketKey) * bucketDays * 24 * 60 * 60 * 1000),
        });
      }

      const bucket = bucketMap.get(bucketKey)!;
      if (vote.isAvailable) {
        bucket.positive++;
      } else {
        bucket.negative++;
      }
    });

    // Convert to array and sort
    buckets.push(...Array.from(bucketMap.values()));
    buckets.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate max for scaling
    const maxVotes = Math.max(...buckets.map(b => b.positive + b.negative), 1);

    // Calculate percentages
    const totalPositive = voteHistory.filter(v => v.isAvailable).length;
    const totalNegative = voteHistory.length - totalPositive;
    const positivePercentage = Math.round((totalPositive / voteHistory.length) * 100);

    return {
      buckets,
      maxVotes,
      timeFrameLabel,
      totalPositive,
      totalNegative,
      positivePercentage,
      daySpan,
    };
  }, [voteHistory]);

  if (!graphData || !voteHistory) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No review data yet</Text>
      </View>
    );
  }

  const barWidth = (width - 40) / graphData.buckets.length;
  const graphHeight = height - 60;

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Reviews:</Text>
        <Text
          style={[
            styles.percentage,
            graphData.positivePercentage >= 70
              ? styles.positive
              : graphData.positivePercentage <= 30
                ? styles.negative
                : styles.mixed,
          ]}
        >
          {graphData.positivePercentage}% positive
        </Text>
      </View>

      <Text style={styles.subtitle}>
        ({graphData.totalPositive.toLocaleString()} positive /{' '}
        {graphData.totalNegative.toLocaleString()} negative)
      </Text>

      <View style={[styles.graphContainer, { height: graphHeight + 20, width: width - 20 }]}>
        <View style={styles.graph}>
          {graphData.buckets.map((bucket, index) => {
            const totalHeight =
              ((bucket.positive + bucket.negative) / graphData.maxVotes) * graphHeight;
            const positiveHeight =
              (bucket.positive / (bucket.positive + bucket.negative)) * totalHeight;
            const negativeHeight = totalHeight - positiveHeight;

            return (
              <View key={index} style={[styles.bar, { width: barWidth }]}>
                <View style={styles.barContent}>
                  {negativeHeight > 0 && (
                    <View
                      style={[styles.barSegment, styles.negativeBar, { height: negativeHeight }]}
                    />
                  )}
                  {positiveHeight > 0 && (
                    <View
                      style={[styles.barSegment, styles.positiveBar, { height: positiveHeight }]}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.xAxis}>
          <Text style={styles.axisLabel}>{graphData.daySpan} days ago</Text>
          <Text style={styles.axisLabel}>Today</Text>
        </View>
      </View>

      <Text style={styles.timeFrame}>{graphData.timeFrameLabel} data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#2a475e',
    borderRadius: 8,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#c7d5e0',
    fontWeight: '600',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positive: {
    color: '#66c0f4',
  },
  negative: {
    color: '#ff6961',
  },
  mixed: {
    color: '#ffa500',
  },
  subtitle: {
    fontSize: 12,
    color: '#8f98a0',
    marginBottom: 12,
  },
  graphContainer: {
    marginBottom: 8,
  },
  graph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 10,
  },
  bar: {
    marginHorizontal: 1,
    justifyContent: 'flex-end',
  },
  barContent: {
    width: '100%',
    flexDirection: 'column-reverse',
  },
  barSegment: {
    width: '100%',
  },
  positiveBar: {
    backgroundColor: '#66c0f4',
  },
  negativeBar: {
    backgroundColor: '#ff6961',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: '#8f98a0',
  },
  timeFrame: {
    fontSize: 11,
    color: '#8f98a0',
    textAlign: 'center',
  },
  noDataText: {
    color: '#8f98a0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

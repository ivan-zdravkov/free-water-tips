import {
  WaterLocation,
  WaterFeedback,
  WaterLocationType,
  VoteHistoryItem,
} from '../types/WaterLocation';

/**
 * In-memory storage for water locations and feedback.
 * This will be replaced with database persistence later.
 * The storage is shared across all Azure Functions in the same process.
 */
class InMemoryStorage {
  private waterLocations: Map<string, WaterLocation> = new Map();
  private feedbackHistory: WaterFeedback[] = [];
  private userVotes: Map<string, WaterFeedback> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Generate realistic vote history over time
   */
  private generateVoteHistory(
    positiveCount: number,
    negativeCount: number,
    daySpan: number,
    trendChange: boolean = false
  ): VoteHistoryItem[] {
    const history: VoteHistoryItem[] = [];
    const now = new Date();
    const totalVotes = positiveCount + negativeCount;

    if (trendChange) {
      // Early votes mostly negative, recent votes mostly positive (or vice versa)
      const earlyNegativeRatio = 0.8;
      const recentPositiveRatio = 0.85;
      const trendChangePoint = Math.floor(totalVotes * 0.75); // 75% through

      for (let i = 0; i < totalVotes; i++) {
        const daysAgo = daySpan * (1 - i / totalVotes);
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        let isAvailable: boolean;
        if (i < trendChangePoint) {
          // Early votes - mostly negative
          isAvailable = Math.random() > earlyNegativeRatio;
        } else {
          // Recent votes - mostly positive
          isAvailable = Math.random() < recentPositiveRatio;
        }

        history.push({ isAvailable, timestamp });
      }
    } else {
      // Consistent pattern
      const positiveRatio = positiveCount / totalVotes;
      for (let i = 0; i < totalVotes; i++) {
        const daysAgo = daySpan * (1 - i / totalVotes);
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        const isAvailable = Math.random() < positiveRatio;
        history.push({ isAvailable, timestamp });
      }
    }

    // Sort by timestamp
    history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return history;
  }

  /**
   * Initialize with sample data for testing
   */
  private initializeSampleData(): void {
    if (this.initialized) return;

    const now = new Date();
    const baseDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

    const sampleLocations: WaterLocation[] = [
      {
        id: 'loc-1',
        type: WaterLocationType.Fountain,
        latitude: 42.6977,
        longitude: 23.3219,
        name: 'Central Park Fountain',
        positiveFeedback: 45,
        negativeFeedback: 3,
        voteHistory: this.generateVoteHistory(45, 3, 45, false), // Green - consistently positive
        createdAt: baseDate.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'loc-2',
        type: WaterLocationType.Restaurant,
        latitude: 42.6979,
        longitude: 23.3225,
        name: 'Green Restaurant',
        positiveFeedback: 5,
        negativeFeedback: 25,
        voteHistory: this.generateVoteHistory(5, 25, 30, false), // Red - consistently negative
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'loc-3',
        type: WaterLocationType.Dispenser,
        latitude: 42.6975,
        longitude: 23.3215,
        name: 'Metro Station Dispenser',
        positiveFeedback: 32,
        negativeFeedback: 28,
        voteHistory: this.generateVoteHistory(32, 28, 50, true), // Yellow - trend changed!
        createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'loc-4',
        type: WaterLocationType.CafeBar,
        latitude: 42.6982,
        longitude: 23.3228,
        name: 'Coffee Corner',
        positiveFeedback: 18,
        negativeFeedback: 14,
        voteHistory: this.generateVoteHistory(18, 14, 25, false), // Yellow - mixed
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'loc-5',
        type: WaterLocationType.PublicBuilding,
        latitude: 42.697,
        longitude: 23.321,
        name: 'City Library',
        positiveFeedback: 2,
        negativeFeedback: 0,
        voteHistory: this.generateVoteHistory(2, 0, 5, false), // Gray - not enough votes
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'loc-6',
        type: WaterLocationType.Park,
        latitude: 42.6985,
        longitude: 23.3232,
        name: 'City Park Water Point',
        positiveFeedback: 80,
        negativeFeedback: 5,
        voteHistory: this.generateVoteHistory(80, 5, 60, false), // Green - very popular
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    sampleLocations.forEach(loc => this.waterLocations.set(loc.id, loc));
    this.initialized = true;
  }

  // Location operations
  getAllLocations(): WaterLocation[] {
    return Array.from(this.waterLocations.values());
  }

  getLocation(id: string): WaterLocation | undefined {
    return this.waterLocations.get(id);
  }

  addLocation(location: WaterLocation): void {
    this.waterLocations.set(location.id, location);
  }

  updateLocation(location: WaterLocation): void {
    this.waterLocations.set(location.id, location);
  }

  deleteLocation(id: string): boolean {
    return this.waterLocations.delete(id);
  }

  // Feedback operations
  addFeedback(feedback: WaterFeedback): void {
    this.feedbackHistory.push(feedback);
  }

  getFeedbackHistory(): WaterFeedback[] {
    return [...this.feedbackHistory];
  }

  // User vote operations
  getUserVote(locationId: string, userId: string): WaterFeedback | undefined {
    const voteKey = `${locationId}-${userId}`;
    return this.userVotes.get(voteKey);
  }

  setUserVote(locationId: string, userId: string, feedback: WaterFeedback): void {
    const voteKey = `${locationId}-${userId}`;
    this.userVotes.set(voteKey, feedback);
  }

  hasUserVoted(locationId: string, userId: string): boolean {
    const voteKey = `${locationId}-${userId}`;
    return this.userVotes.has(voteKey);
  }
}

// Create a singleton instance that will be shared across all functions
export const storage = new InMemoryStorage();

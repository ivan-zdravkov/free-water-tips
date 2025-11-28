export enum WaterLocationType {
  Restaurant = 'restaurant',
  Fountain = 'fountain',
  Dispenser = 'dispenser',
  Cafe = 'cafe',
  Bar = 'bar',
  Other = 'other',
}

export interface VoteHistoryItem {
  isAvailable: boolean;
  timestamp: string;
}

export interface WaterLocation {
  id: string;
  type: WaterLocationType;
  latitude: number;
  longitude: number;
  osmId?: string;
  osmType?: string;
  name?: string;
  positiveFeedback: number;
  negativeFeedback: number;
  voteHistory?: VoteHistoryItem[]; // Chronological list of all votes
  createdAt: string;
  updatedAt: string;
}

export interface WaterFeedback {
  locationId: string;
  latitude: number;
  longitude: number;
  osmId?: string;
  isAvailable: boolean; // true for yes (green), false for no (red)
  timestamp: string;
  userId: string; // Client identifier to prevent duplicate votes
}

export interface GetNearbyLocationsRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

export interface GetNearbyLocationsResponse {
  locations: WaterLocation[];
  total: number;
}

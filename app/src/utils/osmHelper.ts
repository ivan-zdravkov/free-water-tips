import { WaterLocationType } from '../types/WaterLocation';

export interface OSMPlace {
  osmId: string;
  name?: string;
  type: string;
  amenity?: string;
  latitude: number;
  longitude: number;
}

// Map OSM tags to WaterLocationType
export const mapOSMTypeToWaterType = (tags: any): WaterLocationType | null => {
  const amenity = tags.amenity?.toLowerCase();
  const shop = tags.shop?.toLowerCase();
  const leisure = tags.leisure?.toLowerCase();
  const building = tags.building?.toLowerCase();

  if (amenity === 'drinking_water' || amenity === 'fountain' || amenity === 'water_point') {
    return WaterLocationType.Fountain;
  }

  if (amenity === 'restaurant' || amenity === 'fast_food' || amenity === 'food_court') {
    return WaterLocationType.Restaurant;
  }

  if (amenity === 'cafe' || amenity === 'bar' || amenity === 'pub' || amenity === 'biergarten') {
    return WaterLocationType.CafeBar;
  }

  if (
    building === 'public' ||
    amenity === 'library' ||
    amenity === 'townhall' ||
    amenity === 'community_centre'
  ) {
    return WaterLocationType.PublicBuilding;
  }

  if (leisure === 'park' || leisure === 'garden') {
    return WaterLocationType.Park;
  }

  // Check for generic amenities that might have water
  if (amenity || shop) {
    return null; // Unknown but potential water source
  }

  return null;
};

// Fetch OSM data for a specific location using Overpass API
export const fetchOSMLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<OSMPlace | null> => {
  try {
    // Overpass API query to find nearby amenities
    const query = `
      [out:json];
      (
        node(around:${radius},${latitude},${longitude})[amenity];
        way(around:${radius},${latitude},${longitude})[amenity];
        node(around:${radius},${latitude},${longitude})[shop];
        way(around:${radius},${latitude},${longitude})[shop];
        node(around:${radius},${latitude},${longitude})[building];
        way(around:${radius},${latitude},${longitude})[building];
        node(around:${radius},${latitude},${longitude})[leisure];
        way(around:${radius},${latitude},${longitude})[leisure];
      );
      out center tags 1;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OSM data');
    }

    const data = await response.json();

    if (data.elements && data.elements.length > 0) {
      const element = data.elements[0];
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;

      return {
        osmId: `${element.type}/${element.id}`,
        name: element.tags?.name || element.tags?.['name:en'],
        type: element.tags?.amenity || element.tags?.shop || element.tags?.building || 'unknown',
        amenity: element.tags?.amenity,
        latitude: lat,
        longitude: lon,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    return null;
  }
};

// Get a display name for OSM type
export const getOSMTypeDisplayName = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    restaurant: 'Restaurant',
    cafe: 'Café',
    bar: 'Bar',
    pub: 'Pub',
    fountain: 'Fountain',
    drinking_water: 'Drinking Water',
    library: 'Library',
    park: 'Park',
    townhall: 'Town Hall',
    fast_food: 'Fast Food',
    food_court: 'Food Court',
  };

  return typeMap[type.toLowerCase()] || type;
};

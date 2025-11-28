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

  // Water-specific amenities
  if (amenity === 'drinking_water' || amenity === 'fountain' || amenity === 'water_point') {
    return WaterLocationType.Fountain;
  }

  // Food establishments
  if (amenity === 'restaurant' || amenity === 'fast_food' || amenity === 'food_court') {
    return WaterLocationType.Restaurant;
  }

  // Cafes
  if (amenity === 'cafe') {
    return WaterLocationType.Cafe;
  }

  // Bars and pubs
  if (amenity === 'bar' || amenity === 'pub' || amenity === 'biergarten') {
    return WaterLocationType.Bar;
  }

  // Water dispensers or vending machines
  if (amenity === 'vending_machine' && tags.vending === 'water') {
    return WaterLocationType.Dispenser;
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
    // Water sources
    drinking_water: 'Drinking Water',
    fountain: 'Water Fountain',
    water_point: 'Water Point',
    water_well: 'Water Well',
    
    // Food & Drink establishments
    restaurant: 'Restaurant',
    cafe: 'Café',
    bar: 'Bar',
    pub: 'Pub',
    biergarten: 'Beer Garden',
    fast_food: 'Fast Food',
    food_court: 'Food Court',
    
    // Accommodation
    hotel: 'Hotel',
    hostel: 'Hostel',
    guesthouse: 'Guest House',
    
    // Public buildings
    library: 'Library',
    townhall: 'Town Hall',
    community_centre: 'Community Centre',
    hospital: 'Hospital',
    school: 'School',
    university: 'University',
    
    // Transport
    fuel: 'Gas Station',
    parking: 'Parking',
    bus_station: 'Bus Station',
    railway_station: 'Railway Station',
    
    // Leisure
    park: 'Park',
    playground: 'Playground',
    sports_centre: 'Sports Centre',
    swimming_pool: 'Swimming Pool',
    
    // Shopping
    marketplace: 'Marketplace',
    mall: 'Shopping Mall',
    supermarket: 'Supermarket',
    
    // Services
    bank: 'Bank',
    post_office: 'Post Office',
    police: 'Police Station',
    fire_station: 'Fire Station',
    
    // Vending
    vending_machine: 'Vending Machine',
    
    // Religious
    place_of_worship: 'Place of Worship',
    church: 'Church',
    mosque: 'Mosque',
    synagogue: 'Synagogue',
    temple: 'Temple'
  };

  return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

// Get a display name for Free Water Types
export const getFreeWaterTypeDisplayName = (type: WaterLocationType): string => {
  const typeMap: { [key: string]: string } = {
    [WaterLocationType.Restaurant]: 'Restaurant',
    [WaterLocationType.Fountain]: 'Fountain',
    [WaterLocationType.Dispenser]: 'Dispenser',
    [WaterLocationType.Cafe]: 'Café',
    [WaterLocationType.Bar]: 'Bar',
    [WaterLocationType.Other]: 'Other'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

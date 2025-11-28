# Map Feature Implementation

This document describes the newly implemented map feature for the Free Water Tips application.

## Overview

The map feature displays free water locations on an interactive OpenStreetMap using React Native Maps. Users can:

- View their current location on the map
- See nearby free water locations with distinctive icons
- Provide feedback on whether water is available at each location
- View feedback statistics for each location

## Components Created

### Frontend (App)

1. **MapScreen.tsx** (`app/src/screens/MapScreen.tsx`)

   - Full-screen map component with user location tracking
   - Displays water locations as markers with type-specific icons
   - Modal popup for user feedback on each location
   - Real-time fetching of nearby locations based on map region
   - Uses expo-location for GPS positioning

2. **WaterLocation Types** (`app/src/types/WaterLocation.ts`)

   - `WaterLocationType` enum: Restaurant, Fountain, Dispenser, CafeBar, PublicBuilding, Park, Other
   - `WaterLocation` interface: location data structure
   - `WaterFeedback` interface: user feedback structure
   - Request/Response interfaces for API calls

3. **API Service Methods** (`app/src/services/api.ts`)
   - `getNearbyWaterLocations()`: Fetch locations by coordinates and radius
   - `saveWaterFeedback()`: Submit yes/no feedback for a location

### Backend (API)

1. **getNearbyWaterLocations Function** (`api/src/functions/getNearbyWaterLocations.ts`)

   - Azure Function endpoint: `GET /api/water/nearby`
   - Query parameters: latitude, longitude, radiusKm, limit
   - Filters locations using Haversine formula for distance calculation
   - Sorts results by distance from query coordinates
   - In-memory storage with sample data for testing

2. **saveWaterFeedback Function** (`api/src/functions/saveWaterFeedback.ts`)

   - Azure Function endpoint: `POST /api/water/feedback`
   - Accepts: locationId, latitude, longitude, osmId (optional), isAvailable (boolean)
   - Updates feedback counts (positiveFeedback/negativeFeedback)
   - Stores feedback history in-memory
   - Returns updated location data

3. **WaterLocation Types** (`api/src/types/WaterLocation.ts`)
   - Shared type definitions matching frontend types

## Water Location Types

The following location types are supported with distinctive icons:

- **Fountain** (⛲): Public water fountains
- **Restaurant** (🍽️): Restaurants offering free water
- **Dispenser** (🚰): Water dispensers or taps
- **Cafe/Bar** (☕): Cafes and bars with free water
- **Public Building** (🏛️): Libraries, city halls, etc.
- **Park** (🌳): Parks with water sources
- **Other** (💧): Other water sources

## Sample Data

The API is initialized with 6 sample locations in Sofia, Bulgaria for testing:

- Central Park Fountain (Fountain)
- Green Restaurant (Restaurant)
- Metro Station Dispenser (Dispenser)
- Coffee Corner (Cafe/Bar)
- Library (Public Building)
- City Park Water Point (Park)

## In-Memory Storage

Both Azure Functions use static in-memory variables for temporary data storage:

- `waterLocations`: Map of location ID to WaterLocation objects
- `feedbackHistory`: Array of all feedback submissions

**Note**: This is temporary for UI testing. Data persistence to Cosmos DB will be implemented later.

## Configuration

### App Configuration (`app/app.json`)

- Added expo-location plugin
- iOS location permission description
- Android location permissions

### Dependencies Added

- `react-native-maps`: Map component
- `expo-location`: GPS and location services
- `react-native-web-maps`: Web platform support

## API Endpoints

### Get Nearby Locations

```
GET /api/water/nearby?latitude={lat}&longitude={lon}&radiusKm={radius}&limit={limit}
```

Response:

```json
{
  "locations": [...],
  "total": 6
}
```

### Save Feedback

```
POST /api/water/feedback
Content-Type: application/json

{
  "locationId": "loc-1",
  "latitude": 42.6977,
  "longitude": 23.3219,
  "osmId": "optional-osm-id",
  "isAvailable": true
}
```

Response:

```json
{
  "success": true,
  "feedback": {...},
  "location": {...}
}
```

## Next Steps

1. Implement database persistence (Cosmos DB)
2. Add ability to create new water locations
3. Integrate actual OpenStreetMap data
4. Add location search functionality
5. Implement user authentication for feedback
6. Add photo upload capability
7. Implement location verification system

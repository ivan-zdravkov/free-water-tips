import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { WaterLocation, WaterFeedback, WaterLocationType } from '../types/WaterLocation';
import { storage } from '../db/InMemoryStorage';

export async function saveWaterFeedback(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const { locationId, latitude, longitude, osmId, isAvailable, userId, name, type } = body as any;

    // Validate input
    if (!locationId || latitude === undefined || longitude === undefined || !userId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Missing required fields: locationId, latitude, longitude, userId',
        },
      };
    }

    if (typeof isAvailable !== 'boolean') {
      return {
        status: 400,
        jsonBody: {
          error: 'isAvailable must be a boolean value',
        },
      };
    }

    let location = storage.getLocation(locationId);
    let actualLocationId = locationId;

    // If location doesn't exist and this is a temporary ID (new location), create it
    if (!location && locationId.startsWith('temp_')) {
      const newLocation: WaterLocation = {
        id: locationId.replace('temp_', 'loc_'),
        type: type || WaterLocationType.Other,
        latitude,
        longitude,
        name: name || 'Community Added Location',
        positiveFeedback: 0,
        negativeFeedback: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (osmId) {
        newLocation.osmId = osmId;
      }

      storage.addLocation(newLocation);
      location = newLocation;
      actualLocationId = newLocation.id; // Use the permanent ID for voting
      context.log(`Created new location ${newLocation.id} at (${latitude}, ${longitude})`);
    } else if (!location) {
      return {
        status: 404,
        jsonBody: {
          error: 'Location not found',
        },
      };
    }

    // Check if user has already voted (use actualLocationId for the key)
    const previousVote = storage.getUserVote(actualLocationId, userId);

    // Create feedback record (use actualLocationId)
    const feedback: WaterFeedback = {
      locationId: actualLocationId,
      latitude,
      longitude,
      osmId,
      isAvailable,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Update location feedback counts
    if (previousVote) {
      // User is changing their vote
      if (previousVote.isAvailable !== isAvailable) {
        // Remove old vote count
        if (previousVote.isAvailable) {
          location.positiveFeedback = Math.max(0, location.positiveFeedback - 1);
        } else {
          location.negativeFeedback = Math.max(0, location.negativeFeedback - 1);
        }
        // Add new vote count
        if (isAvailable) {
          location.positiveFeedback++;
        } else {
          location.negativeFeedback++;
        }
        context.log(`User ${userId} changed vote for location ${locationId}`);
      } else {
        context.log(`User ${userId} voted the same way again for location ${locationId}`);
      }
    } else {
      // New vote from this user
      if (isAvailable) {
        location.positiveFeedback++;
      } else {
        location.negativeFeedback++;
      }
      context.log(`User ${userId} voted for the first time on location ${actualLocationId}`);
    }

    // Store/update the user's vote
    storage.setUserVote(actualLocationId, userId, feedback);
    storage.addFeedback(feedback);

    // Add to vote history
    if (!location.voteHistory) {
      location.voteHistory = [];
    }
    location.voteHistory.push({
      isAvailable,
      timestamp: feedback.timestamp,
    });

    location.updatedAt = new Date().toISOString();
    storage.updateLocation(location);

    context.log(
      `Feedback saved for location ${actualLocationId}: ${isAvailable ? 'positive' : 'negative'}`
    );

    return {
      status: 201,
      jsonBody: {
        success: true,
        feedback,
        location: location || null,
      },
    };
  } catch (error) {
    context.error('Error saving water feedback:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Failed to save feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

app.http('saveWaterFeedback', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: saveWaterFeedback,
  route: 'water/feedback',
});

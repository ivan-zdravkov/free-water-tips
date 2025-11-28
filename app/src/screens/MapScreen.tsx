import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker, Region } from '../components/MapView';
import * as Location from 'expo-location';
import { WaterLocation, WaterLocationType } from '../types/WaterLocation';
import { getNearbyWaterLocations, saveWaterFeedback } from '../services/api';
import { fetchOSMLocation, mapOSMTypeToWaterType, getOSMTypeDisplayName, getFreeWaterTypeDisplayName } from '../utils/osmHelper';
import {
  determineLocationColor,
  DEFAULT_COLOR_CONFIG,
  getColorHex,
} from '../utils/locationColorAlgorithm';
import { VoteHistoryGraph } from '../components/VoteHistoryGraph';

// Create a custom pin marker HTML for Leaflet (web only)
const createPinMarkerHTML = (
  colorInfo: { color: string },
  type: WaterLocationType,
  size: number = 40
): string => {
  const colorHex = getColorHex(colorInfo.color as any); // Type cast since we know it's a valid LocationColor

  // Material Design Community Icons SVG paths (official icon pack paths)
  const getMaterialIconPath = (type: WaterLocationType): string => {
    const iconPaths: { [key: string]: string } = {
      [WaterLocationType.Fountain]: 'M7,2V4H8V22H6V4A2,2 0 0,0 4,2H3C2.45,2 2,2.45 2,3V4C2,4.55 2.45,5 3,5H4V22H2V24H8V22H10V5H11C11.55,5 12,4.55 12,4V3C12,2.45 11.55,2 11,2H10A2,2 0 0,0 8,2H7Z',
      [WaterLocationType.Restaurant]: 'M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M14.88,11.53C16.32,12.97 16.32,15.31 14.88,16.75C13.44,18.19 11.1,18.19 9.66,16.75C8.22,15.31 8.22,12.97 9.66,11.53L11.77,9.42L14.88,11.53Z',
      [WaterLocationType.Dispenser]: 'M5.5,2C4,2 2.79,3.21 2.79,4.71C2.79,6.21 4,7.42 5.5,7.42C7,7.42 8.21,6.21 8.21,4.71C8.21,3.21 7,2 5.5,2M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20H17A1,1 0 0,0 18,19A1,1 0 0,0 17,18H7Z',
      [WaterLocationType.Cafe]: 'M2,21V19H20V21H2M20,8H18V5L16,5V3H4V5L2,5V8H4V9A4,4 0 0,0 8,13H16A4,4 0 0,0 20,9V8M16,8H6V5H16V8Z',
      [WaterLocationType.Bar]: 'M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8H18A2,2 0 0,1 16,6V4A2,2 0 0,0 14,2H6M8,4H14V6H8V4M8,8H14V10H8V8M8,12H14V14H8V12Z',
      [WaterLocationType.Other]: 'M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25S18,10 18,14A6,6 0 0,1 12,20Z'
    };
    return iconPaths[type] || iconPaths[WaterLocationType.Other];
  };

  const iconPath = getMaterialIconPath(type);

  return `
    <svg width="${size}" height="${size * 1.2}" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <path d="M50 5 C 30 5, 15 20, 15 40 C 15 55, 25 70, 50 115 C 75 70, 85 55, 85 40 C 85 20, 70 5, 50 5 Z" 
            fill="${colorHex}" stroke="none"/>
      <g transform="translate(50, 38) scale(1.4, 1.4) translate(-12, -12)">
        <path d="${iconPath}" fill="white"/>
      </g>
    </svg>
  `;
};

// Generate a device fingerprint based on available browser/device info
const generateDeviceFingerprint = (): string => {
  // Access global objects with type assertions for web environment
  const globalWindow = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
  const globalScreen = typeof globalThis !== 'undefined' ? (globalThis as any).screen : undefined;

  const nav = globalWindow?.navigator;
  if (!nav) {
    // Fallback for non-browser environments
    return `device_${Math.random().toString(36).substr(2, 16)}`;
  }

  const scr = globalScreen || {};

  // Collect device characteristics
  const components = [
    nav.userAgent || '',
    nav.language || '',
    nav.platform || '',
    nav.hardwareConcurrency || '',
    nav.deviceMemory || '',
    nav.maxTouchPoints || '',
    scr.width || '',
    scr.height || '',
    scr.colorDepth || '',
    new Date().getTimezoneOffset().toString(),
  ];

  // Create a simple hash from the components
  const fingerprint = components.join('|');
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `device_${Math.abs(hash).toString(36)}`;
};

// Generate or retrieve a unique user ID based on device fingerprint
const getUserId = (): string => {
  const storageKey = 'freeWaterTips_userId';

  try {
    // Try to get from localStorage first
    let userId = localStorage?.getItem(storageKey);

    if (!userId) {
      // Generate a persistent ID based on device fingerprint
      userId = generateDeviceFingerprint();
      localStorage?.setItem(storageKey, userId);
    }

    return userId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using temporary ID');
    return generateDeviceFingerprint();
  }
};

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 42.6977,
    longitude: 23.3219, // Default to Sofia, Bulgaria
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locations, setLocations] = useState<WaterLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<WaterLocation | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [userId] = useState<string>(getUserId());
  const [showNewLocationModal, setShowNewLocationModal] = useState(false);
  const [newLocationData, setNewLocationData] = useState<{
    latitude: number;
    longitude: number;
    osmId?: string;
    osmName?: string;
    osmType?: string;
    detectedType?: WaterLocationType;
    canChangeType: boolean;
  } | null>(null);
  const [selectedNewLocationType, setSelectedNewLocationType] = useState<WaterLocationType | null>(
    null
  );
  const [fetchingOSM, setFetchingOSM] = useState(false);

  // Request location permissions and get user's current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show your position on the map.'
          );
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Fetch nearby locations
        await fetchNearbyLocations(location.coords.latitude, location.coords.longitude, 0.01);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your location. Using default location.');
        await fetchNearbyLocations(region.latitude, region.longitude, 0.01);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchNearbyLocations = async (
    latitude: number,
    longitude: number,
    latitudeDelta: number = 0.01
  ) => {
    try {
      // Calculate radius based on region delta (approximate)
      const radiusKm = latitudeDelta * 111; // 1 degree ≈ 111km
      const response = await getNearbyWaterLocations(
        latitude,
        longitude,
        Math.max(radiusKm, 5),
        100
      );
      setLocations(response.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to fetch water locations.');
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    // Only fetch locations when region changes, don't update region state
    // to prevent triggering another region change
    fetchNearbyLocations(newRegion.latitude, newRegion.longitude, newRegion.latitudeDelta);
  };

  const handleMarkerPress = (location: WaterLocation) => {
    setSelectedLocation(location);
    setShowFeedbackModal(true);
  };

  const handleFeedback = async (isAvailable: boolean) => {
    if (!selectedLocation) return;

    setSubmittingFeedback(true);
    try {
      const result = await saveWaterFeedback(
        selectedLocation.id,
        selectedLocation.latitude,
        selectedLocation.longitude,
        isAvailable,
        userId,
        selectedLocation.osmId
      );

      Alert.alert('Success', 'Thank you for your feedback!');

      // Update the selected location with new feedback counts
      if (result.location) {
        setSelectedLocation(result.location);
        // Update the location in the locations array
        setLocations(prevLocations =>
          prevLocations.map(loc => (loc.id === result.location!.id ? result.location! : loc))
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
      setShowFeedbackModal(false);
      setSelectedLocation(null);
    }
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedLocation(null);
  };

  const handleMapPress = async (
    coordinate: { latitude: number; longitude: number },
    poiData?: any
  ) => {
    // Check if user clicked on an existing location
    const clickedLocation = locations.find(
      loc =>
        Math.abs(loc.latitude - coordinate.latitude) < 0.0001 &&
        Math.abs(loc.longitude - coordinate.longitude) < 0.0001
    );

    if (clickedLocation) {
      // User clicked on existing marker, show feedback modal
      handleMarkerPress(clickedLocation);
      return;
    }

    // Check if we have POI data from the map hover system
    if (poiData && poiData.modalReady) {
      // Use cached POI data immediately - no API calls needed!
      const detectedType = poiData.tags?.amenity ? mapOSMTypeToWaterType(poiData.tags) : null;

      setNewLocationData({
        latitude: poiData.lat,
        longitude: poiData.lon,
        osmId: poiData.osmId,
        osmName: poiData.name,
        osmType: poiData.type,
        detectedType: detectedType || undefined,
        canChangeType: !detectedType, // Can change type if we couldn't detect it
      });
      setSelectedNewLocationType(detectedType || WaterLocationType.Other);
      setShowNewLocationModal(true);
      return;
    }

    // Fallback: This should not happen with the new system, but kept for safety
    setFetchingOSM(true);
    try {
      const osmPlace = await fetchOSMLocation(coordinate.latitude, coordinate.longitude);

      if (osmPlace) {
        // Found OSM location
        const detectedType = osmPlace.amenity
          ? mapOSMTypeToWaterType({ amenity: osmPlace.amenity })
          : null;

        setNewLocationData({
          latitude: osmPlace.latitude,
          longitude: osmPlace.longitude,
          osmId: osmPlace.osmId,
          osmName: osmPlace.name,
          osmType: osmPlace.type,
          detectedType: detectedType || undefined,
          canChangeType: !detectedType, // Can change type if we couldn't detect it
        });
        setSelectedNewLocationType(detectedType || WaterLocationType.Other);
      } else {
        // No OSM data found - user can select any type
        setNewLocationData({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          canChangeType: true,
        });
        setSelectedNewLocationType(WaterLocationType.Other);
      }

      setShowNewLocationModal(true);
    } catch (error) {
      console.error('Error fetching OSM data:', error);
      Alert.alert('Error', 'Failed to fetch location data.');
    } finally {
      setFetchingOSM(false);
    }
  };

  const handleNewLocationFeedback = async (isAvailable: boolean) => {
    if (!newLocationData || !selectedNewLocationType) return;

    setSubmittingFeedback(true);
    try {
      // Create a temporary location ID for this new location
      const tempLocationId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await saveWaterFeedback(
        tempLocationId,
        newLocationData.latitude,
        newLocationData.longitude,
        isAvailable,
        userId,
        newLocationData.osmId,
        newLocationData.osmName || 'Community Added Location',
        selectedNewLocationType
      );

      Alert.alert('Success', 'Thank you for adding this location!');

      // Refresh locations to see the new one
      await fetchNearbyLocations(region.latitude, region.longitude, region.latitudeDelta);
    } catch (error) {
      console.error('Error submitting new location feedback:', error);
      Alert.alert('Error', 'Failed to add location. Please try again.');
    } finally {
      setSubmittingFeedback(false);
      setShowNewLocationModal(false);
      setNewLocationData(null);
      setSelectedNewLocationType(null);
    }
  };

  const closeNewLocationModal = () => {
    setShowNewLocationModal(false);
    setNewLocationData(null);
    setSelectedNewLocationType(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1b6ec2" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        loadingEnabled={true}
      >
        {/* Render water location markers */}
        {locations.map(location => {
          const colorInfo = determineLocationColor(location, DEFAULT_COLOR_CONFIG);

          // Create custom icon for web
          let customIcon;
          if (Platform.OS === 'web') {
            const L = (globalThis as any).L;
            if (L) {
              const iconHTML = createPinMarkerHTML(colorInfo, location.type, 40);
              customIcon = L.divIcon({
                html: iconHTML,
                className: 'custom-pin-marker',
                iconSize: [40, 48],
                iconAnchor: [20, 48],
                popupAnchor: [0, -48],
              });
            }
          }

          return (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name || 'Water Location'}
              description={`${location.type} - ${colorInfo.reason}`}
              onPress={() => handleMarkerPress(location)}
              icon={customIcon}
            />
          );
        })}
      </MapView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFeedbackModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedLocation?.name || 'Water Location'}</Text>
              <Text style={styles.modalSubtitle}>{selectedLocation && getFreeWaterTypeDisplayName(selectedLocation.type)}</Text>
              
              {selectedLocation?.osmType && (
                <Text style={styles.modalSubtitle}>OSM Type: {getOSMTypeDisplayName(selectedLocation.osmType)}</Text>
              )}

              {selectedLocation && (
                <>
                  <View style={styles.feedbackStats}>
                    <Text style={styles.feedbackStatsText}>
                      👍 {selectedLocation.positiveFeedback} 👎 {selectedLocation.negativeFeedback}
                    </Text>
                  </View>

                  {selectedLocation.voteHistory && selectedLocation.voteHistory.length > 0 && (
                    <VoteHistoryGraph
                      voteHistory={selectedLocation.voteHistory}
                      width={320}
                      height={150}
                    />
                  )}
                </>
              )}

              <Text style={styles.modalQuestion}>Is free water available here?</Text>

              <View style={styles.feedbackButtonContainer}>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.yesButton]}
                  onPress={() => handleFeedback(true)}
                  disabled={submittingFeedback}
                >
                  <Text style={styles.feedbackButtonIcon}>✓</Text>
                  <Text style={styles.feedbackButtonText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.feedbackButton, styles.noButton]}
                  onPress={() => handleFeedback(false)}
                  disabled={submittingFeedback}
                >
                  <Text style={styles.feedbackButtonIcon}>✗</Text>
                  <Text style={styles.feedbackButtonText}>No</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeFeedbackModal}
                disabled={submittingFeedback}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>

              {submittingFeedback && (
                <ActivityIndicator size="small" color="#1b6ec2" style={styles.modalLoader} />
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* New Location Modal */}
      <Modal
        visible={showNewLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeNewLocationModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{newLocationData?.osmName || 'New Location'}</Text>

              {newLocationData?.osmType && (
                <Text style={styles.modalSubtitle}>OSM Type: {getOSMTypeDisplayName(newLocationData.osmType)}</Text>
              )}

              {newLocationData?.canChangeType ? (
                <View style={styles.typeSelector}>
                  <Text style={styles.typeSelectorLabel}>Select location type:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedNewLocationType || WaterLocationType.Other}
                      onValueChange={(itemValue: WaterLocationType) =>
                        setSelectedNewLocationType(itemValue)
                      }
                      style={styles.picker}
                    >
                      {Object.values(WaterLocationType).map(type => (
                        <Picker.Item
                          key={type}
                          label={getFreeWaterTypeDisplayName(type)}
                          value={type}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              ) : (
                newLocationData?.detectedType && (
                  <Text style={styles.modalSubtitle}>
                    {getFreeWaterTypeDisplayName(newLocationData.detectedType)}
                  </Text>
                )
              )}

              <Text style={styles.modalQuestion}>Is free water available here?</Text>

              <View style={styles.feedbackButtonContainer}>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.yesButton]}
                  onPress={() => handleNewLocationFeedback(true)}
                  disabled={submittingFeedback || fetchingOSM}
                >
                  <Text style={styles.feedbackButtonIcon}>✓</Text>
                  <Text style={styles.feedbackButtonText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.feedbackButton, styles.noButton]}
                  onPress={() => handleNewLocationFeedback(false)}
                  disabled={submittingFeedback || fetchingOSM}
                >
                  <Text style={styles.feedbackButtonIcon}>✗</Text>
                  <Text style={styles.feedbackButtonText}>No</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeNewLocationModal}
                disabled={submittingFeedback || fetchingOSM}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>

              {(submittingFeedback || fetchingOSM) && (
                <ActivityIndicator size="small" color="#1b6ec2" style={styles.modalLoader} />
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Info overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.infoText}>📍 {locations.length} water locations nearby</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalScrollView: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  modalQuestion: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  feedbackButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 16,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  yesButton: {
    backgroundColor: '#4caf50',
  },
  noButton: {
    backgroundColor: '#f44336',
  },
  feedbackButtonIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackStats: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  feedbackStatsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalLoader: {
    marginTop: 12,
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeSelectorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#1b6ec2',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});

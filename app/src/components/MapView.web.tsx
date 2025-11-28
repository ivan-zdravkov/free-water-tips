import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getOSMTypeDisplayName } from '../utils/osmHelper';

// Load Leaflet CSS from CDN to avoid local resource warnings
declare const window: any;
declare const document: any;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  // Add custom styles for pin markers
  if (!document.getElementById('custom-marker-styles')) {
    const style = document.createElement('style');
    style.id = 'custom-marker-styles';
    style.textContent = `
      .custom-pin-marker {
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        z-index: 1000 !important;
        position: relative !important;
      }
      .leaflet-container {
        cursor: grab;
      }
      .leaflet-container:active {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(style);
  }
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MarkerProps {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  onPress?: () => void;
  icon?: L.Icon | L.DivIcon;
  children?: React.ReactNode;
}

interface MapViewProps {
  style?: any;
  region?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  onPress?: (coordinate: Coordinate, poiData?: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  loadingEnabled?: boolean;
  children?: React.ReactNode;
}

// Vector tile layer component
class VectorTileLayer {
  private map: L.Map;
  private poiData: Map<string, any> = new Map();

  constructor(map: L.Map) {
    this.map = map;
    this.initializeVectorLayer();
  }

  private initializeVectorLayer() {
    // Setup tile-based POI loading
    this.setupTileBasedPOILoading();
  }

  private setupTileBasedPOILoading() {
    // Load POI data for each tile as needed
    this.map.on('moveend', () => {
      this.loadPOIDataForCurrentView();
    });

    this.map.on('zoomend', () => {
      this.loadPOIDataForCurrentView();
    });

    // Initial load
    this.loadPOIDataForCurrentView();
  }

  private async loadPOIDataForCurrentView() {
    const zoom = this.map.getZoom();

    // Only load POI data when zoomed in enough
    if (zoom < 15) {
      // Reduced from 16 to 15 for earlier loading
      this.poiData.clear();
      return;
    }

    const bounds = this.map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Create a cache key for this view
    const viewKey = `view_${Math.round(sw.lat * 1000)}_${Math.round(sw.lng * 1000)}_${Math.round(ne.lat * 1000)}_${Math.round(ne.lng * 1000)}_${zoom}`;

    if (this.poiData.has(viewKey)) {
      console.log(`POI data already loaded for this view. Total POIs: ${this.poiData.size - 1}`);
      return; // Already loaded this view
    }

    console.log(`Loading POI data for zoom ${zoom}, bounds:`, {
      sw: sw.lat + ',' + sw.lng,
      ne: ne.lat + ',' + ne.lng,
    });

    try {
      // Expanded query to include more POI types
      const query = `
        [out:json][timeout:8];
        (
          node(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[amenity];
          way(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[amenity];
          node(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[shop];
          way(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[shop];
          node(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[tourism];
          way(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[tourism];
          node(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[leisure];
          way(${sw.lat},${sw.lng},${ne.lat},${ne.lng})[leisure];
        );
        out center tags;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.elements?.length || 0} POI elements from API`);

        let addedCount = 0;
        // Store POI data with location-based keys
        data.elements?.forEach((element: any) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;

          if (lat && lon) {
            const locationKey = `poi_${Math.round(lat * 10000)}_${Math.round(lon * 10000)}`;
            this.poiData.set(locationKey, {
              ...element,
              lat,
              lon,
              osmId: `${element.type}/${element.id}`, // Create proper OSM ID
              name: element.tags?.name || element.tags?.['name:en'] || 'Unnamed',
              type: this.getDisplayType(element.tags),
              // Include original tags for modal
              tags: element.tags,
              // Ready-to-use data for modal
              modalReady: true,
            });
            addedCount++;
          }
        });

        console.log(`Added ${addedCount} POIs to cache. Total cached: ${this.poiData.size}`);

        // Mark this view as loaded
        this.poiData.set(viewKey, { loaded: true });
      }
    } catch (error) {
      console.error('Failed to load POI data:', error);
    }
  }

  private getDisplayType(tags: any): string {
    let rawType = 'location';
    
    if (tags.amenity) rawType = tags.amenity;
    else if (tags.shop) rawType = tags.shop;
    else if (tags.tourism) rawType = tags.tourism;
    else if (tags.leisure) rawType = tags.leisure;
    else if (tags.building) rawType = tags.building;
    
    return getOSMTypeDisplayName(rawType);
  }

  public getPOIAt(lat: number, lon: number, radiusMeters: number = 25): any {
    let closestPOI = null;
    let minDistance = radiusMeters;

    for (const [key, poi] of this.poiData.entries()) {
      // Skip view keys and invalid POIs
      if (key.startsWith('view_') || !poi.lat || !poi.lon) continue;

      const distance = Math.sqrt(
        Math.pow((poi.lat - lat) * 111000, 2) +
          Math.pow((poi.lon - lon) * 111000 * Math.cos((lat * Math.PI) / 180), 2)
      );

      if (distance <= minDistance) {
        closestPOI = poi;
        minDistance = distance;
      }
    }

    return closestPOI;
  }

  public getStats(): { totalPOIs: number; viewsLoaded: number } {
    let totalPOIs = 0;
    let viewsLoaded = 0;

    for (const [key, value] of this.poiData.entries()) {
      if (key.startsWith('view_')) {
        viewsLoaded++;
      } else if (key.startsWith('poi_')) {
        totalPOIs++;
      }
    }

    return { totalPOIs, viewsLoaded };
  }

  public destroy() {
    this.poiData.clear();
  }
}

// Helper component to update map view when region changes
function MapController({
  region,
  onRegionChangeComplete,
  onMapPress,
}: {
  region?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  onMapPress?: (coordinate: Coordinate, poiData?: any) => void;
}) {
  const map = useMap();
  const initialLoadRef = useRef(true);
  const vectorTileLayerRef = useRef<VectorTileLayer | null>(null);

  useEffect(() => {
    if (region) {
      map.setView([region.latitude, region.longitude], calculateZoom(region.latitudeDelta), {
        animate: true,
      });
    }
  }, [region, map]);

  useEffect(() => {
    // Initialize vector tile layer
    vectorTileLayerRef.current = new VectorTileLayer(map);

    return () => {
      vectorTileLayerRef.current?.destroy();
    };
  }, [map]);

  useEffect(() => {
    if (onRegionChangeComplete) {
      const handleMoveEnd = () => {
        // Skip the first moveend event (initial load)
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          return;
        }

        const center = map.getCenter();
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        const newRegion: Region = {
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: Math.abs(ne.lat - sw.lat),
          longitudeDelta: Math.abs(ne.lng - sw.lng),
        };

        onRegionChangeComplete(newRegion);
      };

      map.on('moveend', handleMoveEnd);
      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }
  }, [map, onRegionChangeComplete]);

  useEffect(() => {
    if (onMapPress) {
      const handleClick = (e: any) => {
        const { lat, lng } = e.latlng;

        // Don't trigger OSM POI clicks if clicking on a custom pin
        const isOverCustomPin = isMouseOverCustomPin(e.originalEvent);
        if (isOverCustomPin) {
          return; // Let the custom pin's onClick handler deal with it
        }

        // Check if there's a POI at this location
        const poi = vectorTileLayerRef.current?.getPOIAt(lat, lng);

        // Only call onMapPress if there's a POI
        if (poi) {
          onMapPress({ latitude: lat, longitude: lng }, poi);
        }
      };

      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, onMapPress]);

  // Add mousemove handler for cursor and tooltip changes
  useEffect(() => {
    const handleMouseMove = (e: any) => {
      const { lat, lng } = e.latlng;
      const zoom = map.getZoom();
      const container = map.getContainer() as HTMLElement;

      // Check if mouse is over a custom pin marker first
      const isOverCustomPin = isMouseOverCustomPin(e.originalEvent);
      
      if (isOverCustomPin) {
        // Custom pin takes priority - set pointer cursor but don't show OSM tooltip
        (container as any).style.cursor = 'pointer';
        hideLocationTooltip();
        return;
      }

      // Only check for POIs when zoomed in enough and not over a custom pin
      if (zoom < 15) {
        (container as any).style.cursor = '';
        hideLocationTooltip();
        return;
      }

      // Check for POI at current location
      const poi = vectorTileLayerRef.current?.getPOIAt(lat, lng);

      if (poi) {
        (container as any).style.cursor = 'pointer';
        showLocationTooltip(poi, container);
      } else {
        (container as any).style.cursor = '';
        hideLocationTooltip();
      }
    };

    const handleMouseOut = () => {
      const container = map.getContainer() as HTMLElement;
      (container as any).style.cursor = '';
      hideLocationTooltip();
    };

    // Add debugging handler for testing
    const handleDoubleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      const stats = vectorTileLayerRef.current?.getStats();
      console.log('Map stats:', stats);
      console.log('Checking POI at:', lat, lng);
      const poi = vectorTileLayerRef.current?.getPOIAt(lat, lng);
      console.log('Found POI:', poi);
    };

    map.on('mousemove', handleMouseMove);
    map.on('mouseout', handleMouseOut);
    map.on('dblclick', handleDoubleClick);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('mouseout', handleMouseOut);
      map.off('dblclick', handleDoubleClick);
    };
  }, [map]);

  // Helper function to check if mouse is over a custom pin marker
  const isMouseOverCustomPin = (event: MouseEvent): boolean => {
    if (!event.target) return false;
    
    const target = event.target as HTMLElement;
    
    // Check if the target or any parent has the custom-pin-marker class
    let element: HTMLElement | null = target;
    while (element) {
      const htmlElement = element as any;
      if (htmlElement.classList && htmlElement.classList.contains('custom-pin-marker')) {
        return true;
      }
      // Also check for Leaflet marker classes that might contain our custom pins
      if (htmlElement.classList && (
        htmlElement.classList.contains('leaflet-marker-icon') ||
        htmlElement.classList.contains('leaflet-div-icon')
      )) {
        // Check if this marker contains our custom pin HTML
        const html = htmlElement.innerHTML;
        if (html && (html.includes('teardrop-pin') || html.includes('svg'))) {
          return true;
        }
      }
      element = htmlElement.parentElement;
    }
    
    return false;
  };

  // Show tooltip with location information
  const showLocationTooltip = (poi: any, container: HTMLElement) => {
    hideLocationTooltip(); // Remove existing tooltip

    const name = poi.name || 'Unknown';
    const type = poi.type || 'location';

    const tooltip = document.createElement('div');
    tooltip.id = 'poi-location-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.innerHTML = `
      <strong>${name}</strong><br>
      ${type}
    `;

    document.body.appendChild(tooltip);

    // Update tooltip position on mouse move
    const handleMouseMove = (e: any) => {
      const rect = tooltip.getBoundingClientRect();
      let left = e.clientX + 10; // 10px offset from cursor
      let top = e.clientY - rect.height - 10; // Above cursor with 10px offset

      // Keep tooltip within viewport bounds
      if (left + rect.width > window.innerWidth) {
        left = e.clientX - rect.width - 10; // Show to left of cursor
      }
      if (top < 0) {
        top = e.clientY + 10; // Show below cursor
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    (tooltip as any)._handleMouseMove = handleMouseMove;
  };

  // Hide location tooltip
  const hideLocationTooltip = () => {
    const existing = document.getElementById('poi-location-tooltip');
    if (existing) {
      if ((existing as any)._handleMouseMove) {
        document.removeEventListener('mousemove', (existing as any)._handleMouseMove);
      }
      existing.remove();
    }
  };

  return null;
}

export const Marker: React.FC<MarkerProps> = ({
  coordinate,
  title,
  description,
  onPress,
  icon,
  children,
}) => {
  const position: [number, number] = [coordinate.latitude, coordinate.longitude];

  // Use provided icon, or extract icon text from nested React elements
  let customIcon = icon;

  if (!customIcon && children) {
    let iconHtml = '';
    if (typeof children === 'object' && 'props' in children) {
      const childProps = (children as any).props;
      // Navigate through View -> Text structure to get the emoji
      if (
        childProps.children &&
        typeof childProps.children === 'object' &&
        'props' in childProps.children
      ) {
        const textProps = childProps.children.props;
        if (textProps.children && typeof textProps.children === 'string') {
          iconHtml = textProps.children;
        }
      }
    }

    // Create custom icon from children if provided
    if (iconHtml) {
      customIcon = L.divIcon({
        html: `<div style="font-size: 28px; line-height: 32px; text-align: center;">${iconHtml}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    }
  }

  return (
    <LeafletMarker
      position={position}
      icon={customIcon}
      eventHandlers={{
        click: onPress,
      }}
    />
  );
};

const MapView: React.FC<MapViewProps> = ({
  style,
  region,
  onRegionChangeComplete,
  onPress,
  showsUserLocation,
  children,
}) => {
  const defaultCenter: [number, number] = [42.6977, 23.3219];
  const center: [number, number] = region ? [region.latitude, region.longitude] : defaultCenter;
  const zoom = region ? calculateZoom(region.latitudeDelta) : 13;

  return (
    <div style={{ ...styles.map, ...(style || {}) }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
          onMapPress={onPress}
        />
        {children}
      </MapContainer>
    </div>
  );
};

// Helper function to calculate zoom level from latitudeDelta
function calculateZoom(latitudeDelta: number): number {
  const zoom = Math.round(Math.log2(360 / latitudeDelta));
  return Math.max(1, Math.min(zoom, 18));
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default MapView;
export { MapView };
export const PROVIDER_DEFAULT = null;

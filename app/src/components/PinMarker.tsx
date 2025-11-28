import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LocationColor, getColorHex } from '../utils/locationColorAlgorithm';
import { WaterLocationType } from '../types/WaterLocation';

interface PinMarkerProps {
  color: LocationColor;
  type: WaterLocationType;
  size?: number;
}

/**
 * Teardrop pin-shaped marker with flat icon inside
 */
export function PinMarker({ color, type, size = 40 }: PinMarkerProps) {
  const colorHex = getColorHex(color);
  const iconGlyph = getTypeIcon(type);

  return (
    <View style={[styles.container, { width: size, height: size * 1.3 }]}>
      <Svg width={size} height={size * 1.3} viewBox="0 0 40 52">
        {/* Pin shape - teardrop */}
        <Path
          d="M20 0 C9 0 0 9 0 20 C0 28 6 34 12 42 L20 52 L28 42 C34 34 40 28 40 20 C40 9 31 0 20 0 Z"
          fill="white"
          stroke={colorHex}
          strokeWidth="3"
        />

        {/* Inner circle for icon background */}
        <Circle cx="20" cy="18" r="12" fill={colorHex} />

        {/* Icon text */}
        <text x="20" y="23" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">
          {iconGlyph}
        </text>
      </Svg>
    </View>
  );
}

/**
 * Get flat icon glyph for location type
 */
function getTypeIcon(type: WaterLocationType): string {
  switch (type) {
    case WaterLocationType.Restaurant:
      return '🍽';
    case WaterLocationType.Fountain:
      return '⛲';
    case WaterLocationType.Dispenser:
      return '🚰';
    case WaterLocationType.CafeBar:
      return '☕';
    case WaterLocationType.PublicBuilding:
      return '🏛';
    case WaterLocationType.Park:
      return '🌳';
    case WaterLocationType.Other:
      return '💧';
    default:
      return '💧';
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

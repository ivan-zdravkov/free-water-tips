import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function AppNavigation() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        <Text style={styles.logo}>Free Water Tips</Text>
        
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              isActive('Map') && styles.navButtonActive
            ]}
            onPress={() => navigation.navigate('Map')}
            accessibilityLabel="Navigate to Map"
            accessibilityRole="button"
          >
            <Text style={[
              styles.navButtonText,
              isActive('Map') && styles.navButtonTextActive
            ]}>
              🗺️ Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              isActive('About') && styles.navButtonActive
            ]}
            onPress={() => navigation.navigate('About')}
            accessibilityLabel="Navigate to About"
            accessibilityRole="button"
          >
            <Text style={[
              styles.navButtonText,
              isActive('About') && styles.navButtonTextActive
            ]}>
              ℹ️ About
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b6ec2',
    paddingTop: Platform.OS === 'web' ? 0 : 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      },
    }),
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextActive: {
    fontWeight: 'bold',
  },
});

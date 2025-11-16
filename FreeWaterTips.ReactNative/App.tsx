import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { Platform } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import AppNavigation from './src/components/AppNavigation';

declare const window: any;

const screenConfigs = [
  { name: 'Map', path: '', component: HomeScreen },
  { name: 'About', path: 'about', component: AboutScreen },
] as const;

export type RootStackParamList = {
  [K in (typeof screenConfigs)[number]['name']]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [
    'https://ivan-zdravkov.github.io/free-water-tips',
    'https://ivan-zdravkov.github.io/free-water-tips-test',
    'https://freewater.tips',
    'https://test.freewater.tips',
  ],
  config: {
    screens: screenConfigs.reduce(
      (acc, screen) => {
        acc[screen.name] = screen.path;
        return acc;
      },
      {} as Record<string, string>
    ),
  },
};

export default function App() {
  const navigationRef = useRef<any>();

  const handleNavigationReady = () => {
    if (Platform.OS === 'web') {
      const url = new URL(window.location.href);
      const query = url.search;
      if (query.startsWith('?/')) {
        const path = query.slice(2);
        const screen = screenConfigs.find(s => s.path === path);
        if (screen) {
          navigationRef.current?.navigate(screen.name);
        }
        window.history.replaceState({}, '', '/' + path);
      }
    }
  };

  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef} linking={linking} onReady={handleNavigationReady}>
        <Stack.Navigator
          initialRouteName="Map"
          screenOptions={{
            header: () => <AppNavigation />,
            cardStyle: { flex: 1 },
          }}
        >
          {screenConfigs.map(screen => (
            <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

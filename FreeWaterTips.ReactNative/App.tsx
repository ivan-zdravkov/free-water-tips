import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import AppNavigation from './src/components/AppNavigation';

export type RootStackParamList = {
  Map: undefined;
  Weather: undefined;
  About: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Map"
        screenOptions={{
          header: () => <AppNavigation />,
          cardStyle: { flex: 1 },
        }}
      >
        <Stack.Screen 
          name="Map" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

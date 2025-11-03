import React from 'react';
import { View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Map will be added here */}
    </View>
  );
}

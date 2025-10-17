import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Free Water Tips</Text>
        
        <Text style={styles.heading}>Our Mission</Text>
        <Text style={styles.text}>
          Water is a right, not a product. This app is dedicated to promoting access to 
          free drinking water for everyone, everywhere.
        </Text>

        <Text style={styles.heading}>Why This Matters</Text>
        <Text style={styles.text}>
          Access to clean drinking water is a basic human necessity. By connecting users 
          with restaurants, cafes, and other establishments that offer free drinking water, 
          we aim to promote sustainability and reduce plastic waste.
        </Text>

        <Text style={styles.heading}>Features</Text>
        <Text style={styles.text}>
          • Find the nearest locations offering free drinking water{'\n'}
          • Cross-platform support (Web, Android, iOS){'\n'}
          • Free and anonymous usage{'\n'}
          • Community contributions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1b6ec2',
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

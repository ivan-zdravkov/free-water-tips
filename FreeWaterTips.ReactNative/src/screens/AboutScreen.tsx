import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { getHealth } from '../services/api';
import { HealthResponse } from '../types/api';

interface CommunityStats {
  totalLocations: number;
  totalContributors: number;
  countriesServed: number;
  lastUpdated: string;
}

export default function AboutScreen() {
  const [stats, setStats] = useState<CommunityStats>({
    totalLocations: 0,
    totalContributors: 0,
    countriesServed: 0,
    lastUpdated: 'Loading...'
  });

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, using placeholder data
    setStats({
      totalLocations: 0,
      totalContributors: 0,
      countriesServed: 0,
      lastUpdated: new Date().toLocaleDateString()
    });

    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      setHealthLoading(true);
      const healthData = await getHealth();
      setHealth(healthData);
      setHealthError(null);
    } catch (err) {
      setHealthError('Failed to load health status');
      console.error(err);
    } finally {
      setHealthLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const shareOnPlatform = (platform: string) => {
    const url = 'https://freewater.tips';
    const text = 'Check out Free Water Tips - Find free drinking water sources near you!';
    
    const shareUrls: { [key: string]: string } = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      openLink(shareUrls[platform]);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.card}>
        <Text style={styles.title}>About Free Water Tips</Text>
        <Text style={styles.subtitle}>Water is a right, not a product.</Text>
      </View>

        {/* Our Mission */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text>
            The UN believes that water is a{' '}
            <Text 
              onPress={() => openLink('https://www.unwater.org/water-facts/human-rights-water-and-sanitation')}
            >
              fundamental human right
            </Text>
            {' '}and should not be treated as a commodity.
          </Text>
          <Text>
            Our mission is to make it easier for people to find places that serve safe drinking water 
            not burdened by a product or service tax, promoting sustainability and reducing plastic waste.
          </Text>
        </View>

        {/* Why This Matters */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why This Matters</Text>
          
          <View>
            <Text>🌱</Text>
            <View>
              <Text>Environmental Impact</Text>
              <Text> Reduce plastic waste</Text>
            </View>
          </View>

          <View>
            <Text>💰</Text>
            <View>
              <Text>Save Money</Text>
              <Text> Avoid unnecessary expenses on bottled water</Text>
            </View>
          </View>

          <View>
            <Text>👥</Text>
            <View>
              <Text>Community</Text>
              <Text> Encourage businesses to provide free water</Text>
            </View>
          </View>

          <View>
            <Text>🌍</Text>
            <View>
              <Text>Human Rights</Text>
              <Text> Promote water as a shared resource</Text>
            </View>
          </View>
        </View>

        {/* Created by Ivan Zdravkov */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Created by Ivan Zdravkov</Text>
          <Text>
            This project was created by{' '}
            <Text onPress={() => openLink('https://zdravkov.dev')}>
              Ivan Zdravkov
            </Text>
            , a passionate developer dedicated to making clean drinking water more accessible to everyone.
          </Text>
          
          <View>
            <TouchableOpacity 
              onPress={() => openLink('https://github.com/ivan-zdravkov')}
            >
              <Text>🔗 GitHub Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://www.linkedin.com/in/ivan-zdravkov/')}
            >
              <Text>🔗 LinkedIn Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://zdravkov.dev')}
            >
              <Text>🌐 Personal Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support the Project */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support the Project</Text>
          <Text>
            This project is and always will be free and open-source. 
            If you find it useful and want to support the mission, consider making a donation:
          </Text>
          
          <View>
            <TouchableOpacity 
              onPress={() => openLink('https://github.com/sponsors/ivan-zdravkov')}
            >
              <Text>💝 GitHub Sponsors</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://paypal.me/IZdravkov')}
            >
              <Text>💳 PayPal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://revolut.me/ivan_zdravkov')}
            >
              <Text>💷 Revolut</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Open Source */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Open Source</Text>
          <Text>
            This project is licensed under the{' '}
            <Text 
              onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips?tab=GPL-3.0-1-ov-file')}
            >
              GNU General Public License v3.0
            </Text>
            . The source code is available on GitHub and contributions are welcome! 
            Found a bug? Please{' '}
            <Text 
              onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips/blob/main/CONTRIBUTING.md#reporting-bugs')}
            >
              follow our bug reporting guidelines
            </Text>
            {' '}to help us improve the platform.
          </Text>
          
          <View>
            <TouchableOpacity 
              onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips')}
            >
              <Text>📦 Source Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips/issues')}
            >
              <Text>🐛 Report Bug</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Impact Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Impact</Text>
          
          <View>
            <View>
              <Text>💧</Text>
              <Text>{stats.totalLocations}</Text>
              <Text>Water Sources</Text>
            </View>
            
            <View>
              <Text>👥</Text>
              <Text>{stats.totalContributors}</Text>
              <Text>Contributors</Text>
            </View>
            
            <View>
              <Text>🌍</Text>
              <Text>{stats.countriesServed}</Text>
              <Text>Countries Served</Text>
            </View>
          </View>
          
          <Text>Last updated: {stats.lastUpdated}</Text>
        </View>

        {/* Mobile App Section - Hidden for now since we're PWA only */}
        {/* Future native apps would be shown here */}

        {/* Share Free Water Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share Free Water Tips</Text>
          <Text>
            Help spread the word about free water access! Share this project with your friends and community 
            to help more people discover free water sources.
          </Text>
          
          <View>
            <TouchableOpacity 
              onPress={() => shareOnPlatform('x')}
            >
              <Text>🐦 X</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => shareOnPlatform('facebook')}
            >
              <Text>📘 Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => shareOnPlatform('linkedin')}
            >
              <Text>💼 LinkedIn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => shareOnPlatform('reddit')}
            >
              <Text>🤖 Reddit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => shareOnPlatform('whatsapp')}
            >
              <Text>💬 WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => shareOnPlatform('telegram')}
            >
              <Text>✈️ Telegram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Health Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Health</Text>
          {healthLoading ? (
            <ActivityIndicator />
          ) : healthError ? (
            <Text>{healthError}</Text>
          ) : health ? (
            <View>
              <View>
                <Text>Status:</Text>
                <Text>{health.status}</Text>
              </View>
              <View>
                <Text>Environment:</Text>
                <Text>{health.environment}</Text>
              </View>
              <View>
                <Text>Cosmos DB:</Text>
                <Text>
                  {health.cosmosConnected ? '✓ Connected' : '✗ Disconnected'}
                </Text>
              </View>
              <Text>
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 12,
  },
});

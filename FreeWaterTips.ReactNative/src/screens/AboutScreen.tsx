import React, { useEffect, useState } from 'react';
import { ScrollView, Linking } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  ActivityIndicator,
  Divider,
  Chip,
  Text,
} from 'react-native-paper';
import { getHealth } from '../services/api';
import { HealthResponse, Environment } from '@free-water-tips/shared';

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
    lastUpdated: 'Loading...',
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
      lastUpdated: new Date().toLocaleDateString(),
    });

    // Only load health status when NOT in production
    if (!Environment.isProduction) {
      loadHealthStatus();
    }
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
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Title style={{ textAlign: 'center' }}>About Free Water Tips</Title>
          <Paragraph style={{ textAlign: 'center', fontStyle: 'italic' }}>
            Water is a right, not a product.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Our Mission */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Our Mission</Title>
          <Paragraph>
            The UN believes that water is a{' '}
            <Text
              style={{ color: '#0066cc', textDecorationLine: 'underline' }}
              onPress={() =>
                openLink('https://www.unwater.org/water-facts/human-rights-water-and-sanitation')
              }
            >
              fundamental human right
            </Text>{' '}
            and should not be treated as a commodity.
          </Paragraph>
          <Paragraph>
            Our mission is to make it easier for people to find places that serve safe drinking
            water not burdened by a product or service tax, promoting sustainability and reducing
            plastic waste.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Why This Matters */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Why This Matters</Title>
          <List.Item
            title="Environmental Impact"
            description="Reduce plastic waste"
            left={props => <List.Icon {...props} icon="leaf" />}
          />
          <List.Item
            title="Save Money"
            description="Avoid unnecessary expenses on bottled water"
            left={props => <List.Icon {...props} icon="cash" />}
          />
          <List.Item
            title="Community"
            description="Encourage businesses to provide free water"
            left={props => <List.Icon {...props} icon="account-group" />}
          />
          <List.Item
            title="Human Rights"
            description="Promote water as a shared resource"
            left={props => <List.Icon {...props} icon="earth" />}
          />
        </Card.Content>
      </Card>

      {/* Created by Ivan Zdravkov */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Created by Ivan Zdravkov</Title>
          <Paragraph>
            This project was created by{' '}
            <Text
              style={{ color: '#0066cc', textDecorationLine: 'underline' }}
              onPress={() => openLink('https://zdravkov.dev')}
            >
              Ivan Zdravkov
            </Text>
            , a passionate developer dedicated to making clean drinking water more accessible to
            everyone.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => openLink('https://github.com/ivan-zdravkov')}>GitHub</Button>
          <Button onPress={() => openLink('https://www.linkedin.com/in/ivan-zdravkov/')}>
            LinkedIn
          </Button>
          <Button onPress={() => openLink('https://zdravkov.dev')}>Website</Button>
        </Card.Actions>
      </Card>

      {/* Support the Project */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Support the Project</Title>
          <Paragraph>
            This project is and always will be free and open-source. If you find it useful and want
            to support the mission, consider making a donation:
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => openLink('https://github.com/sponsors/ivan-zdravkov')}>
            GitHub Sponsors
          </Button>
          <Button onPress={() => openLink('https://paypal.me/IZdravkov')}>PayPal</Button>
          <Button onPress={() => openLink('https://revolut.me/ivan_zdravkov')}>Revolut</Button>
        </Card.Actions>
      </Card>

      {/* Open Source */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Open Source</Title>
          <Paragraph>
            This project is licensed under the{' '}
            <Text
              style={{ color: '#0066cc', textDecorationLine: 'underline' }}
              onPress={() =>
                openLink('https://github.com/ivan-zdravkov/free-water-tips?tab=GPL-3.0-1-ov-file')
              }
            >
              GNU General Public License v3.0
            </Text>
            . The source code is available on GitHub and contributions are welcome! Found a bug?
            Please{' '}
            <Text
              style={{ color: '#0066cc', textDecorationLine: 'underline' }}
              onPress={() =>
                openLink(
                  'https://github.com/ivan-zdravkov/free-water-tips/blob/main/CONTRIBUTING.md#reporting-bugs'
                )
              }
            >
              follow our bug reporting guidelines
            </Text>{' '}
            to help us improve the platform.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips')}>
            Source Code
          </Button>
          <Button
            onPress={() => openLink('https://github.com/ivan-zdravkov/free-water-tips/issues')}
          >
            Report Bug
          </Button>
        </Card.Actions>
      </Card>

      {/* Community Impact Stats */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Community Impact</Title>
          <List.Item
            title={stats.totalLocations.toString()}
            description="Water Sources"
            left={props => <List.Icon {...props} icon="water" />}
          />
          <List.Item
            title={stats.totalContributors.toString()}
            description="Contributors"
            left={props => <List.Icon {...props} icon="account-group" />}
          />
          <List.Item
            title={stats.countriesServed.toString()}
            description="Countries Served"
            left={props => <List.Icon {...props} icon="earth" />}
          />
          <Paragraph style={{ marginTop: 8 }}>Last updated: {stats.lastUpdated}</Paragraph>
        </Card.Content>
      </Card>

      {/* Share Free Water Tips */}
      <Card style={{ margin: 16, marginTop: 0 }}>
        <Card.Content>
          <Title>Share Free Water Tips</Title>
          <Paragraph>
            Help spread the word about free water access! Share this project with your friends and
            community to help more people discover free water sources.
          </Paragraph>
        </Card.Content>
        <Card.Actions style={{ flexWrap: 'wrap' }}>
          <Button onPress={() => shareOnPlatform('x')}>X</Button>
          <Button onPress={() => shareOnPlatform('facebook')}>Facebook</Button>
          <Button onPress={() => shareOnPlatform('linkedin')}>LinkedIn</Button>
          <Button onPress={() => shareOnPlatform('reddit')}>Reddit</Button>
          <Button onPress={() => shareOnPlatform('whatsapp')}>WhatsApp</Button>
          <Button onPress={() => shareOnPlatform('telegram')}>Telegram</Button>
        </Card.Actions>
      </Card>

      {/* System Health Status - Only shown when NOT in production */}
      {!Environment.isProduction && (
        <Card style={{ margin: 16, marginTop: 0, marginBottom: 32 }}>
          <Card.Content>
            <Title>System Health</Title>
            {healthLoading ? (
              <ActivityIndicator />
            ) : healthError ? (
              <Paragraph>{healthError}</Paragraph>
            ) : health ? (
              <>
                <List.Item title="Status" description={health.status} />
                <List.Item title="Environment" description={health.environment} />
                <List.Item
                  title="Cosmos DB"
                  description={health.cosmosConnected ? 'Connected' : 'Disconnected'}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={health.cosmosConnected ? 'check-circle' : 'close-circle'}
                    />
                  )}
                />
                {health.error && (
                  <List.Item
                    title="Error"
                    description={health.error}
                    left={props => <List.Icon {...props} icon="alert-circle" />}
                    titleStyle={{ color: '#d32f2f' }}
                    descriptionStyle={{ color: '#d32f2f' }}
                  />
                )}
                <Divider />
                <Paragraph style={{ marginTop: 8 }}>
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </Paragraph>
              </>
            ) : null}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

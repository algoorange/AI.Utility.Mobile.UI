import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, Image, Alert, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Divider, 
  Chip, 
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { Audio } from 'expo-av';
import { Header } from '../components';
import { Dispute, BackendDispute } from '../data/mockBills';

interface DisputeDetailsScreenProps {
  route: {
    params: {
      dispute: Dispute;
      backendDispute?: BackendDispute;
    };
  };
  navigation: any;
}

export const DisputeDetailsScreen: React.FC<DisputeDetailsScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { dispute, backendDispute } = route.params;
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'open':
        return theme.colors.primary;
      case 'Under Review':
      case 'under_review':
        return theme.colors.tertiary;
      case 'Resolved':
      case 'resolved':
        return theme.colors.primary;
      case 'Rejected':
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getIssueTypeLabel = (issueType: string) => {
    const typeMap: Record<string, string> = {
      'high_bill': 'High Bill Amount',
      'wrong_meter_reading': 'Wrong Meter Reading',
      'payment_issue': 'Payment Issue',
      'late_fee': 'Late Fee',
      'other': 'Other'
    };
    return typeMap[issueType] || issueType;
  };

  const togglePlayback = async () => {
    if (!dispute.voiceNote) return;

    try {
      if (playing && soundRef.current) {
        await soundRef.current.stopAsync();
        setPlaying(false);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: dispute.voiceNote },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setPlaying(true);
      setPlaybackError(null);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing voice note:', error);
      setPlaybackError('Failed to play voice note');
      setPlaying(false);
    }
  };

  const handleImagePress = () => {
    if (dispute.attachment) {
      Alert.alert('Evidence Photo', 'Full-size image view would be implemented here.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Dispute Details" showBackButton onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Dispute Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.disputeHeader}>
              <View style={styles.disputeInfo}>
                <Text variant="headlineSmall" style={styles.disputeId}>
                  {dispute.id}
                </Text>
                <Text variant="titleMedium" style={styles.billId}>
                  Bill ID: {dispute.billId}
                </Text>
                <Chip 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(dispute.status) + '20' }]}
                  textStyle={{ color: getStatusColor(dispute.status) }}
                >
                  {dispute.status}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Dispute Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Dispute Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Dispute ID:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>{dispute.id}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Bill ID:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>{dispute.billId}</Text>
            </View>
            
            {backendDispute && (
              <>
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Issue Type:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {getIssueTypeLabel(backendDispute.issue_type)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Status:</Text>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getStatusColor(dispute.status) + '20' }]}
                    textStyle={{ color: getStatusColor(dispute.status) }}
                  >
                    {dispute.status}
                  </Chip>
                </View>
                
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Submitted:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {formatDate(dispute.submittedAt)}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Description
            </Text>
            <Divider style={styles.divider} />
            <Text variant="bodyLarge" style={styles.description}>
              {dispute.comments}
            </Text>
          </Card.Content>
        </Card>

        {/* AI Analysis - Only show if backend dispute data is available */}
        {backendDispute && (backendDispute.ai_summary || backendDispute.ai_suggestion || backendDispute.ai_reading) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                AI Analysis
              </Text>
              <Divider style={styles.divider} />

              {backendDispute.ai_reading && (
                <View style={styles.aiSection}>
                  <Text variant="titleMedium" style={styles.aiLabel}>
                    AI Reading:
                  </Text>
                  <Text variant="bodyLarge" style={styles.aiContent}>
                    {backendDispute.ai_reading}
                  </Text>
                </View>
              )}
              
              {backendDispute.ai_summary && (
                <View style={styles.aiSection}>
                  <Text variant="titleMedium" style={styles.aiLabel}>
                    AI Summary:
                  </Text>
                  <Text variant="bodyLarge" style={styles.aiContent}>
                    {backendDispute.ai_summary}
                  </Text>
                </View>
              )}
              
              {backendDispute.ai_suggestion && (
                <View style={styles.aiSection}>
                  <Text variant="titleMedium" style={styles.aiLabel}>
                    AI Suggestion:
                  </Text>
                  <Text variant="bodyLarge" style={[styles.aiContent, styles.aiSuggestion]}>
                    {backendDispute.ai_suggestion}
                  </Text>
                </View>
              )}
              
              {backendDispute.ai_confidence && (
                <View style={styles.aiSection}>
                  <Text variant="titleMedium" style={styles.aiLabel}>
                    AI Confidence:
                  </Text>
                  <Chip 
                    style={[styles.confidenceChip, { backgroundColor: theme.colors.primary + '20' }]}
                    textStyle={{ color: theme.colors.primary }}
                  >
                    {backendDispute.ai_confidence}
                  </Chip>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Evidence Photo */}
        {dispute.attachment && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Evidence Photo
              </Text>
              <Divider style={styles.divider} />
              <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
                <Image 
                  source={{ uri: dispute.attachment }} 
                  style={styles.evidenceImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text variant="bodySmall" style={styles.imageHint}>
                Tap image to view full size
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Voice Note */}
        {dispute.voiceNote && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Voice Note
              </Text>
              <Divider style={styles.divider} />
              <View style={styles.voiceSection}>
                <Button
                  mode="outlined"
                  icon={playing ? 'stop' : 'play'}
                  onPress={togglePlayback}
                  style={styles.voiceButton}
                  disabled={!!playbackError}
                >
                  {playing ? 'Stop Recording' : 'Play Voice Note'}
                </Button>
                {playbackError && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {playbackError}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Resolution - Only show if resolved */}
        {backendDispute?.resolution && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Resolution
              </Text>
              <Divider style={styles.divider} />
              <Text variant="bodyLarge" style={styles.resolution}>
                {backendDispute.resolution}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {dispute.status === 'Submitted' || dispute.status === 'open' ? (
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Contact Support', 'Contact support functionality would be implemented here.')}
              style={styles.actionButton}
              icon="phone"
            >
              Contact Support
            </Button>
          ) : null}
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Download', 'Download dispute details functionality would be implemented here.')}
            style={styles.actionButton}
            icon="download"
          >
            Download Details
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 16
  },
  card: {
    borderRadius: 16,
    elevation: 2
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  disputeInfo: {
    flex: 1
  },
  disputeId: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  billId: {
    marginBottom: 8,
    opacity: 0.8
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold'
  },
  divider: {
    marginVertical: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  detailLabel: {
    flex: 1,
    opacity: 0.7
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '500'
  },
  description: {
    lineHeight: 24,
    textAlign: 'justify'
  },
  aiSection: {
    marginBottom: 16
  },
  aiLabel: {
    fontWeight: '600',
    marginBottom: 8
  },
  aiContent: {
    lineHeight: 22,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace'
  },
  aiSuggestion: {
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  confidenceChip: {
    alignSelf: 'flex-start'
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8
  },
  imageHint: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic'
  },
  voiceSection: {
    alignItems: 'center'
  },
  voiceButton: {
    borderRadius: 12
  },
  errorText: {
    color: '#c62828',
    marginTop: 8,
    textAlign: 'center'
  },
  resolution: {
    lineHeight: 24,
    textAlign: 'justify',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8
  },
  actionButtons: {
    gap: 12,
    marginTop: 8
  },
  actionButton: {
    borderRadius: 12
  }
});

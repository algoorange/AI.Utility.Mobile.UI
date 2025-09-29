import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { Button, Card, HelperText, Modal, Portal, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Header, VoiceRecorder } from '../components';
import { useAppState } from '../hooks';
import type { Dispute, DisputeStatus, BackendDispute } from '../data/mockBills';
import { apiService } from '../services/api';
import { DisputeStackParamList } from '../navigation/DisputeStackNavigator';

const statusColors: Record<DisputeStatus, string> = {
  Submitted: '#1e88e5',
  'Under Review': '#fb8c00',
  Resolved: '#2e7d32',
  Rejected: '#c62828',
  open: '#1e88e5'
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const issueTypes = [
  { value: 'high_bill', label: 'High Bill Amount' },
  { value: 'wrong_meter_reading', label: 'Wrong Meter Reading' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'other', label: 'Other' }
];

type DisputeScreenNavigationProp = StackNavigationProp<DisputeStackParamList, 'DisputeList'>;

export const DisputeScreen: React.FC = () => {
  const navigation = useNavigation<DisputeScreenNavigationProp>();
  const { disputes, backendDisputes, bills, addDispute, fetchDisputes, refreshDisputes, isLoadingDisputes, disputesError, customerId, disputesLastFetched } = useAppState();
  const [selectedBill, setSelectedBill] = useState('');
  const [billMenuVisible, setBillMenuVisible] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueTypeMenuVisible, setIssueTypeMenuVisible] = useState(false);
  const [comments, setComments] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleSelect = (id: string) => {
    setSelectedBill(id);
    setBillMenuVisible(false);
  };

  const handleIssueTypeSelect = (type: string) => {
    setIssueType(type);
    setIssueTypeMenuVisible(false);
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCapture = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (selectedBill.trim().length === 0 || issueType.trim().length === 0 || !imageUri) {
      Alert.alert('Missing Information', 'Please fill in all required fields and attach a photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // For React Native, create a file-like object that works with FormData
      const fileInfo = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'evidence.jpg',
      };

      // Submit to backend
      const result = await apiService.submitDispute({
        bill_id: selectedBill.trim(),
        customer_id: customerId, // Use customer ID from app state
        issue_type: issueType,
        description: comments.trim() || 'No additional comments provided',
        evidence_photo: fileInfo as any
      });

      if (result.success) {
        // Also add to local state for immediate UI update
        const newDispute: Dispute = {
          id: result.dispute_id || `DSP-${Date.now()}`,
          billId: selectedBill.trim(),
          status: 'Submitted',
          submittedAt: new Date().toISOString(),
          comments: comments.trim(),
          attachment: imageUri,
          voiceNote: voiceUri
        };

        addDispute(newDispute);
        setShowSuccess(true);
        setIsFormVisible(false);
        resetForm();
      } else {
        Alert.alert('Submission Failed', result.message || 'Failed to submit dispute. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting dispute:', error);
      Alert.alert('Error', 'Failed to submit dispute. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedBill('');
    setIssueType('');
    setComments('');
    setImageUri(null);
    setVoiceUri(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (customerId) {
        await refreshDisputes(customerId);
      }
    } catch (error) {
      console.error('Error refreshing disputes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisputePress = (dispute: Dispute) => {
    // Find the corresponding backend dispute data
    const backendDispute = backendDisputes.find(d => d.dispute_id === dispute.id);
    navigation.navigate('DisputeDetails', { 
      dispute, 
      backendDispute: backendDispute || undefined 
    });
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    resetForm();
  };

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        // ignore
      }
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        // ignore
      }
      soundRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const togglePlayback = useCallback(
    async (disputeId: string, uri: string | null | undefined) => {
      if (!uri) {
        return;
      }

      setPlaybackError(null);

      if (playingId === disputeId) {
        await stopPlayback();
        return;
      }

      await stopPlayback();

      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        setPlayingId(disputeId);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            return;
          }

          if (!status.isPlaying) {
            stopPlayback().catch(() => undefined);
          }
        });

        await sound.playAsync();
      } catch (error) {
        setPlaybackError('Unable to play the voice note.');
        await stopPlayback();
      }
    },
    [playingId, stopPlayback]
  );

  const hasError = isFormVisible && (selectedBill.trim().length === 0 || issueType.trim().length === 0);

  useEffect(() => {
    if (!showSuccess) {
      return;
    }

    const timeout = setTimeout(() => setShowSuccess(false), 2000);

    return () => clearTimeout(timeout);
  }, [showSuccess]);

  // Load disputes on component mount only if not already loaded or data is stale (older than 5 minutes)
  useEffect(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const shouldFetch = customerId && 
      customerId !== 'demo-user' && // Don't fetch for demo users
      (disputes.length === 0 || !disputesLastFetched || disputesLastFetched < fiveMinutesAgo) && 
      !isLoadingDisputes;
    
    if (shouldFetch) {
      fetchDisputes(customerId);
    }
  }, [customerId]); // Only depend on customerId to prevent continuous triggering

  useEffect(() => {
    return () => {
      stopPlayback().catch(() => undefined);
    };
  }, [stopPlayback]);

  return (
    <View style={styles.container}>
      <Header title="Dispute" canGoBack />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1e88e5']}
            tintColor="#1e88e5"
          />
        }
      >
        {!isFormVisible ? (
          <>
            <Button
              mode="contained"
              icon="plus"
              style={styles.primaryAction}
              onPress={() => setIsFormVisible(true)}
            >
              Submit New Dispute
            </Button> 
 
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">Your Disputes</Text>
                
                {/* Loading State */}
                {isLoadingDisputes && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text variant="bodyMedium" style={styles.loadingText}>
                      Loading disputes...
                    </Text>
                  </View>
                )}

                {/* Error State */}
                {disputesError && !isLoadingDisputes && (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color="#c62828" />
                    <Text variant="bodyMedium" style={styles.errorText}>
                      {disputesError}
                    </Text>
                    <Button mode="outlined" onPress={handleRefresh} style={styles.retryButton}>
                      Retry
                    </Button>
                  </View>
                )}

                {/* Empty State */}
                {!isLoadingDisputes && !disputesError && disputes.length === 0 && (
                  <Text variant="bodyMedium" style={styles.emptyState}>
                    You have not submitted any disputes yet.
                  </Text>
                )}

                {/* Disputes List */}
                {!isLoadingDisputes && !disputesError && disputes.length > 0 && (
                  disputes.map((dispute, index) => {
                    const formattedDate = formatDate(dispute.submittedAt);

                    const handleToggle = () => {
                      togglePlayback(dispute.id, dispute.voiceNote).catch(() => undefined);
                    };

                    const isCurrent = playingId === dispute.id;

                    return (
                      <TouchableOpacity
                        key={dispute.id}
                        style={[styles.disputeItem, index !== 0 && styles.disputeItemDivider]}
                        onPress={() => handleDisputePress(dispute)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.disputeHeader}>
                          <View>
                            <Text variant="titleMedium">{dispute.billId}</Text>
                            <Text variant="bodySmall" style={styles.disputeMeta}>
                              Dispute ID: {dispute.id}
                            </Text>
                          </View>
                          <View
                            style={[styles.statusPill, { backgroundColor: statusColors[dispute.status] }]}
                          >
                            <Text style={styles.statusText}>{dispute.status}</Text>
                          </View>
                        </View>
                        {dispute.comments.length > 0 && (
                          <Text variant="bodyMedium" style={styles.disputeComments}>
                            {dispute.comments}
                          </Text>
                        )}

                        {dispute.voiceNote && (
                          <View style={styles.voicePlayback}>
                            <Button
                              mode="outlined"
                              icon={isCurrent ? 'stop' : 'play'}
                              onPress={handleToggle}
                            >
                              {isCurrent ? 'Stop' : 'Play Voice Note'}
                            </Button>
                          </View>
                        )}

                        <Text variant="bodySmall" style={styles.disputeMeta}>
                          Submitted on {formattedDate}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </Card.Content>
            </Card>


          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">Submit a Dispute</Text>
              
              <TouchableOpacity onPress={() => setBillMenuVisible(true)}>
                <TextInput
                  label="Select Bill ID *"
                  mode="outlined"
                  value={selectedBill ? bills.find(bill => bill.id === selectedBill)?.id || selectedBill : ''}
                  placeholder="Choose a bill"
                  style={styles.input}
                  editable={false}
                  showSoftInputOnFocus={false}
                  pointerEvents="none"
                  right={<TextInput.Icon icon={billMenuVisible ? 'chevron-up' : 'chevron-down'} />}
                />
              </TouchableOpacity>
              <HelperText type={selectedBill.trim().length === 0 ? 'error' : 'info'} visible>
                {selectedBill.trim().length === 0 ? 'Please select a bill to dispute' : 'Choose the bill you want to dispute'}
              </HelperText>

              <TouchableOpacity onPress={() => setIssueTypeMenuVisible(true)}>
                <TextInput
                  label="Issue Type *"
                  mode="outlined"
                  value={issueType ? issueTypes.find(type => type.value === issueType)?.label || issueType : ''}
                  placeholder="Select issue type"
                  style={styles.input}
                  editable={false}
                  showSoftInputOnFocus={false}
                  pointerEvents="none"
                  right={<TextInput.Icon icon={issueTypeMenuVisible ? 'chevron-up' : 'chevron-down'} />}
                />
              </TouchableOpacity>
              <HelperText type={issueType.trim().length === 0 ? 'error' : 'info'} visible>
                {issueType.trim().length === 0 ? 'Please select an issue type' : 'Type of issue you are reporting'}
              </HelperText>

              <TextInput
                label="Provide details"
                mode="outlined"
                multiline
                numberOfLines={6}
                value={comments}
                onChangeText={setComments}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                placeholder="Describe the issue in detail..."
              />

              <View style={styles.buttonRow}>
                <Button mode="outlined" icon="upload" onPress={handleUpload}>
                  Upload Photo
                </Button>
                <Button mode="outlined" icon="camera" onPress={handleCapture}>
                  Capture Photo
                </Button>
              </View>

              {imageUri && (
                <View style={styles.previewContainer}>
                  <Text variant="bodyMedium" style={styles.previewLabel}>Evidence Photo *</Text>
                  <Image source={{ uri: imageUri }} style={styles.preview} />
                </View>
              )}
              {!imageUri && (
                <HelperText type="error" visible>
                  Photo evidence is required
                </HelperText>
              )}

              <VoiceRecorder value={voiceUri} onChange={setVoiceUri} />

              <View style={styles.formActions}>
                <Button mode="text" onPress={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  icon={isSubmitting ? undefined : "send"} 
                  onPress={handleSubmit} 
                  disabled={hasError || isSubmitting || !imageUri}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {playbackError && (
        <HelperText type="error" visible style={styles.voiceError}>
          {playbackError}
        </HelperText>
      )}

      <Portal>
        <Modal visible={showSuccess} onDismiss={() => setShowSuccess(false)} contentContainerStyle={styles.modalContent}>
          <MaterialCommunityIcons name="check-circle" size={96} color="#2e7d32" />
          <Text variant="titleMedium" style={styles.modalText}>
            Dispute submitted!
          </Text>
        </Modal>

        {/* Bill Selection Dropdown Modal */}
        <Modal 
          visible={billMenuVisible} 
          onDismiss={() => setBillMenuVisible(false)} 
          contentContainerStyle={styles.dropdownModal}
        >
          <View style={styles.dropdownContainer}>
            <Text variant="titleMedium" style={styles.dropdownTitle}>
              Select Bill ID
            </Text>
            <FlatList
              data={bills}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text variant="bodyLarge">{item.id}</Text>
                  <Text variant="bodyMedium" style={styles.dropdownItemSubtext}>
                    {item.account} • ${item.amount}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
            <Button 
              mode="outlined" 
              onPress={() => setBillMenuVisible(false)}
              style={styles.dropdownCancelButton}
            >
              Cancel
            </Button>
          </View>
        </Modal>

        {/* Issue Type Selection Dropdown Modal */}
        <Modal 
          visible={issueTypeMenuVisible} 
          onDismiss={() => setIssueTypeMenuVisible(false)} 
          contentContainerStyle={styles.dropdownModal}
        >
          <View style={styles.dropdownContainer}>
            <Text variant="titleMedium" style={styles.dropdownTitle}>
              Select Issue Type
            </Text>
            <FlatList
              data={issueTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleIssueTypeSelect(item.value)}
                >
                  <Text variant="bodyLarge">{item.label}</Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
            <Button 
              mode="outlined" 
              onPress={() => setIssueTypeMenuVisible(false)}
              style={styles.dropdownCancelButton}
            >
              Cancel
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16
  },
  card: {
    borderRadius: 20
  },
  input: {
    marginTop: 12
  },
  textArea: {
    marginTop: 12,
    borderRadius: 12,
    minHeight: 100
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12
  },
  previewContainer: {
    marginTop: 16
  },
  previewLabel: {
    marginBottom: 8,
    fontWeight: '600'
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 16
  },
  submit: {
    marginTop: 16,
    borderRadius: 12
  },
  primaryAction: {
    marginTop: 16,
    borderRadius: 12
  },
  voicePlayback: {
    marginTop: 12
  },
  voiceError: {
    textAlign: 'center'
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    alignSelf: 'center'
  },
  modalText: {
    marginTop: 12
  },
  emptyState: {
    marginTop: 16,
    color: '#6b7280'
  },
  disputeItem: {
    paddingVertical: 12
  },
  disputeItemDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d1d5db',
    marginTop: 12
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  disputeComments: {
    marginTop: 8
  },
  disputeMeta: {
    marginTop: 4,
    color: '#6b7280'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16
  },
  dropdownModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: '70%'
  },
  dropdownContainer: {
    padding: 20
  },
  dropdownTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  dropdownList: {
    maxHeight: 300
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb'
  },
  dropdownItemSubtext: {
    color: '#6b7280',
    marginTop: 2
  },
  dropdownCancelButton: {
    marginTop: 16
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280'
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#c62828',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 8
  }
});


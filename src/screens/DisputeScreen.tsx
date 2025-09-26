import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Header, VoiceRecorder } from '@components';
import { useAppState } from '@hooks';
import type { Dispute, DisputeStatus } from '@data/mockBills';

const statusColors: Record<DisputeStatus, string> = {
  Submitted: '#1e88e5',
  'Under Review': '#fb8c00',
  Resolved: '#2e7d32',
  Rejected: '#c62828'
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export const DisputeScreen: React.FC = () => {
  const { disputes, addDispute } = useAppState();
  const [selectedBill, setSelectedBill] = useState('');
  const [comments, setComments] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleSelect = (id: string) => setSelectedBill(id);

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

  const handleSubmit = () => {
    if (selectedBill.trim().length === 0) {
      return;
    }

    const newDispute: Dispute = {
      id: `DSP-${Date.now()}`,
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
    setSelectedBill('');
    setComments('');
    setImageUri(null);
    setVoiceUri(null);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedBill('');
    setComments('');
    setImageUri(null);
    setVoiceUri(null);
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

  const hasError = isFormVisible && selectedBill.trim().length === 0;

  useEffect(() => {
    if (!showSuccess) {
      return;
    }

    const timeout = setTimeout(() => setShowSuccess(false), 2000);

    return () => clearTimeout(timeout);
  }, [showSuccess]);

  useEffect(() => {
    return () => {
      stopPlayback().catch(() => undefined);
    };
  }, [stopPlayback]);

  return (
    <View style={styles.container}>
      <Header title="Dispute" canGoBack />
      <ScrollView contentContainerStyle={styles.content}>
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
                {disputes.length === 0 ? (
                  <Text variant="bodyMedium" style={styles.emptyState}>
                    You have not submitted any disputes yet.
                  </Text>
                ) : (
                  disputes.map((dispute, index) => {
                    const formattedDate = formatDate(dispute.submittedAt);

                    const handleToggle = () => {
                      togglePlayback(dispute.id, dispute.voiceNote).catch(() => undefined);
                    };

                    const isCurrent = playingId === dispute.id;

                    return (
                      <View
                        key={dispute.id}
                        style={[styles.disputeItem, index !== 0 && styles.disputeItemDivider]}
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
                      </View>
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
              <TextInput
                label="Select Bill ID"
                mode="outlined"
                value={selectedBill}
                onChangeText={handleSelect}
                placeholder="e.g. BIL-2024-0001"
                style={styles.input}
              />
              <HelperText type={hasError ? 'error' : 'info'} visible>
                {hasError ? 'Please select a bill to dispute' : 'Enter the bill ID to dispute'}
              </HelperText>

              <TextInput
                label="Provide details"
                mode="outlined"
                multiline
                numberOfLines={8}
                value={comments}
                onChangeText={setComments}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />

              <View style={styles.buttonRow}>
                <Button mode="outlined" icon="upload" onPress={handleUpload}>
                  Upload Photo
                </Button>
                <Button mode="outlined" icon="camera" onPress={handleCapture}>
                  Capture Photo
                </Button>
              </View>

              {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

              <VoiceRecorder value={voiceUri} onChange={setVoiceUri} />

              <View style={styles.formActions}>
                <Button mode="text" onPress={handleCancel}>
                  Cancel
                </Button>
                <Button mode="contained" icon="send" onPress={handleSubmit} disabled={hasError}>
                  Submit Dispute
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
  preview: {
    marginTop: 16,
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
  voicePlayback: {
    marginTop: 12
  },
  voiceError: {
    textAlign: 'center'
  }
});


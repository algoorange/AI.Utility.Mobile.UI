import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Button, Text, HelperText } from 'react-native-paper';

interface VoiceRecorderProps {
  value: string | null;
  onChange: (uri: string | null) => void;
}

const formatDuration = (millis: number) => {
  if (!millis) {
    return '00:00';
  }

  const totalSeconds = Math.floor(millis / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ value, onChange }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Audio.requestPermissionsAsync();
      setHasPermission(result.granted);
      if (!result.granted) {
        setError('Microphone permission is required to record a voice note.');
      }
    } catch (err) {
      setError('Unable to request microphone permission.');
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    requestPermission();

    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => undefined);
        soundRef.current.unloadAsync().catch(() => undefined);
        soundRef.current = null;
      }
    };
  }, [requestPermission]);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        // Ignore playback unload errors
      }
    }
    soundRef.current = null;
    setIsPlaying(false);
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (hasPermission === false) {
      setError('Microphone permission is required to record a voice note.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (hasPermission === null) {
        await requestPermission();
      }

      if (hasPermission === false) {
        return;
      }

      await stopPlayback();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.canRecord) {
          return;
        }

        if (status.isRecording) {
          setRecordingDuration(status.durationMillis ?? 0);
        }
      });
    } catch (err) {
      setError('Unable to start recording. Please try again.');
      recordingRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, requestPermission, stopPlayback]);

  const handleStopRecording = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    setIsLoading(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      onChange(uri ?? null);
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (err) {
      setError('Unable to stop recording.');
    } finally {
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch (err) {
        // Ignore cleanup errors
      }

      recordingRef.current = null;
      setIsLoading(false);
    }
  }, [onChange]);

  const togglePlayback = useCallback(async () => {
    if (!value) {
      return;
    }

    if (isPlaying) {
      await stopPlayback();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: value });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }
        if (!status.isPlaying) {
          stopPlayback();
        }
      });
      setIsPlaying(true);
      await sound.playAsync();
    } catch (err) {
      setError('Unable to play the voice note.');
      await stopPlayback();
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, stopPlayback, value]);

  const handleRemove = useCallback(async () => {
    await stopPlayback();
    onChange(null);
  }, [onChange, stopPlayback]);

  const instructions = useMemo(() => {
    if (!value) {
      return 'Record a short audio note to include with your dispute.';
    }

    return 'Preview your voice note or replace it with a new recording.';
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium">Voice note</Text>
        {value && (
          <Text variant="bodySmall" style={styles.duration}>
            {isRecording ? formatDuration(recordingDuration) : 'Ready'}
          </Text>
        )}
      </View>

      <HelperText type="info" visible style={styles.helperText}>
        {instructions}
      </HelperText>

      <View style={styles.actions}>
        {isRecording ? (
          <Button
            mode="contained"
            onPress={handleStopRecording}
            icon="stop"
            loading={isLoading}
            buttonColor="#c62828"
          >
            Stop
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={handleStartRecording}
            icon="microphone"
            loading={isLoading}
            disabled={isLoading}
          >
            {value ? 'Re-record' : 'Record'}
          </Button>
        )}

        <Button
          mode="outlined"
          icon={isPlaying ? 'stop' : 'play'}
          onPress={togglePlayback}
          disabled={!value || isRecording}
          loading={isLoading && isPlaying}
        >
          {isPlaying ? 'Stop' : 'Play' }
        </Button>

        <Button mode="text" onPress={handleRemove} disabled={!value || isRecording}>
          Remove
        </Button>
      </View>

      {!value && isRecording && (
        <Text variant="bodySmall" style={styles.duration}>
          Recording… {formatDuration(recordingDuration)}
        </Text>
      )}

      {error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12
  },
  helperText: {
    marginLeft: 0,
    marginBottom: 12
  },
  duration: {
    color: '#6b7280'
  }
});



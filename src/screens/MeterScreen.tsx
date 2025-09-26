import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '@components';

export const MeterScreen: React.FC = () => {
  const theme = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedReading, setExtractedReading] = useState('');

  const requestPermission = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExtractedReading('45123');
    }
  };

  const handleCaptureImage = async () => {
    await requestPermission();
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExtractedReading('45123');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Meter" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Upload Meter Reading</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Upload a photo or capture using camera, then confirm the auto-detected reading.
            </Text>

            <View style={styles.buttonRow}>
              <Button mode="contained" icon="upload" onPress={handlePickImage} style={styles.button}>
                Upload Photo
              </Button>
              <Button mode="outlined" icon="camera" onPress={handleCaptureImage} style={styles.button}>
                Capture Photo
              </Button>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            )}

            <Divider style={styles.divider} />

            <Text variant="titleMedium">Extracted Reading</Text>
            <TextInput
              value={extractedReading}
              onChangeText={setExtractedReading}
              mode="outlined"
              style={styles.input}
              placeholder="Enter reading"
              keyboardType="numeric"
            />

            <Button mode="contained" icon="check" style={styles.submit}>
              Submit Reading
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  subtitle: {
    marginTop: 8,
    color: 'gray'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12
  },
  button: {
    flex: 1,
    borderRadius: 12
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#E1E6ED'
  },
  divider: {
    marginVertical: 16
  },
  input: {
    marginTop: 8
  },
  submit: {
    marginTop: 16,
    borderRadius: 12
  }
});


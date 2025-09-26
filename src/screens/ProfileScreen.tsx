import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, Switch, Text } from 'react-native-paper';
import { Header } from '@components';
import { useThemeMode, useAppState } from '@hooks';

export const ProfileScreen: React.FC = () => {
  const { isDark, toggleTheme } = useThemeMode();
  const { paymentMethods } = useAppState();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Account Settings</Text>
            <List.Section>
              <List.Item
                title="Biometric Login"
                description="FaceID / TouchID"
                right={() => (
                  <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
                )}
                left={() => <List.Icon icon="fingerprint" />}
              />
              <List.Item
                title="Dark Mode"
                right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
                left={() => <List.Icon icon="theme-light-dark" />}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Payment Methods</Text>
            {paymentMethods.map((method) => (
              <List.Item
                key={method.id}
                title={method.label}
                description={method.isDefault ? 'Default' : method.type}
                left={() => <List.Icon icon="credit-card-outline" />}
                right={() => <Button mode="text">Manage</Button>}
              />
            ))}
            <Button icon="plus" mode="outlined" style={styles.addButton}>
              Add new method
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
    padding: 16,
    gap: 16
  },
  card: {
    borderRadius: 20
  },
  addButton: {
    marginTop: 12,
    borderRadius: 12
  }
});


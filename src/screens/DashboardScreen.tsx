import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { useAppState } from '@hooks';
import { Header, InfoCard, ConsumptionChart } from '@components';

export const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { bills, consumption } = useAppState();

  const upcomingBill = bills.find((bill) => bill.status === 'Due' || bill.status === 'Overdue');
  const paidBillsCount = bills.filter((bill) => bill.status === 'Paid').length;

  return (
    <View style={styles.container}>
      <Header title="Algo AI meter reader" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Outstanding Balance</Text>
            <Text variant="headlineLarge" style={{ color: theme.colors.primary, marginVertical: 8 }}>
              {upcomingBill ? `$${upcomingBill.amount.toFixed(2)}` : '$0.00'}
            </Text>
            <Text variant="bodyMedium">Due date: {upcomingBill?.dueDate ?? 'No dues'}</Text>
            <Button mode="contained" style={styles.button} icon="credit-card">
              Quick Pay
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.infoRow}>
          <InfoCard label="Paid bills" value={`${paidBillsCount}`} />
          <InfoCard label="Pending" value={`${bills.length - paidBillsCount}`} accent />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Consumption Overview
            </Text>
            <ConsumptionChart data={consumption} />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Divider style={styles.divider} />
            <List.Item title="Upload meter reading" left={() => <List.Icon icon="camera" />} />
            <List.Item title="Dispute bill amount" left={() => <List.Icon icon="alert-circle" />} />
            <List.Item title="Chat with support" left={() => <List.Icon icon="chat" />} />
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
    borderRadius: 20,
    elevation: 4
  },
  button: {
    marginTop: 16,
    borderRadius: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  sectionTitle: {
    marginBottom: 12
  },
  divider: {
    marginVertical: 12
  }
});


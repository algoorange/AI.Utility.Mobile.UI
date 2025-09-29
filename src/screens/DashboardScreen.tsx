import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppState } from '../hooks';
import { Header, InfoCard, ConsumptionChart } from '../components';

export const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { bills, backendBills, consumption, customerId, fetchBills, isLoadingBills, billsLastFetched } = useAppState();

  // Fetch bills on component mount only if not already loaded or data is stale (older than 5 minutes)
  useEffect(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const shouldFetch = customerId && 
      customerId !== 'demo-user' && // Don't fetch for demo users
      (bills.length === 0 || !billsLastFetched || billsLastFetched < fiveMinutesAgo) && 
      !isLoadingBills;
    
    if (shouldFetch) {
      fetchBills(customerId);
    }
  }, [customerId]); // Only depend on customerId to prevent continuous triggering

  const upcomingBill = bills.find((bill) => bill.status === 'Due' || bill.status === 'Overdue');
  const paidBillsCount = bills.filter((bill) => bill.status === 'Paid').length;

  const handleQuickPay = () => {
    if (upcomingBill) {
      // Find the corresponding backend bill data
      const backendBill = backendBills.find(b => b.bill_id === upcomingBill.id);
      // Navigate to Bills tab and then to bill details
      (navigation as any).navigate('Bills', { screen: 'BillDetails', params: { bill: upcomingBill, backendBill } });
    }
  };

  const handleAIHelp = () => {
    (navigation as any).navigate('AIHelp');
  };

  const handleMeterReading = () => {
    (navigation as any).navigate('Meter');
  };

  const handleDisputeBill = () => {
    (navigation as any).navigate('Dispute');
  };

  const handleSupportChat = () => {
    (navigation as any).navigate('Support');
  };

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
            <Button mode="contained" style={styles.button} icon="credit-card" onPress={handleQuickPay}>
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
            
            {/* AI Help Button - Prominently displayed */}
            <TouchableOpacity style={styles.aiHelpButton} onPress={handleAIHelp}>
              <View style={styles.aiHelpContent}>
                <MaterialCommunityIcons name="robot" size={24} color="#9c27b0" />
                <View style={styles.aiHelpText}>
                  <Text variant="titleMedium" style={styles.aiHelpTitle}>AI Assistant</Text>
                  <Text variant="bodySmall" style={styles.aiHelpSubtitle}>Get instant help with your questions</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity onPress={handleMeterReading}>
              <List.Item 
                title="Upload meter reading" 
                left={() => <List.Icon icon="camera" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleDisputeBill}>
              <List.Item 
                title="Dispute bill amount" 
                left={() => <List.Icon icon="alert-circle" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSupportChat}>
              <List.Item 
                title="Contact support team" 
                left={() => <List.Icon icon="chat" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </TouchableOpacity>
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
  },
  aiHelpButton: {
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e1bee7'
  },
  aiHelpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  aiHelpText: {
    flex: 1,
    marginLeft: 12
  },
  aiHelpTitle: {
    color: '#9c27b0',
    fontWeight: '600'
  },
  aiHelpSubtitle: {
    color: '#666',
    marginTop: 2
  }
});


import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Button, Chip, Searchbar, SegmentedButtons, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header, BillListItem } from '../components';
import { useAppState } from '../hooks';
import { Bill } from '../data/mockBills';
import { BillsStackParamList } from '../navigation/BillsStackNavigator';

type Filter = 'all' | 'electricity' | 'water';
type Status = 'all' | 'Paid' | 'Due' | 'Overdue';

type BillsScreenNavigationProp = StackNavigationProp<BillsStackParamList, 'BillsList'>;

export const BillsScreen: React.FC = () => {
  const navigation = useNavigation<BillsScreenNavigationProp>();
  const { 
    bills, 
    backendBills,
    customerId, 
    fetchBills, 
    refreshBills, 
    isLoadingBills, 
    billsError,
    billsLastFetched
  } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [status, setStatus] = useState<Status>('all');
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredBills = useMemo(() => {
    console.log('BillsScreen - Total bills:', bills.length);
    console.log('BillsScreen - Bills data:', bills);
    console.log('BillsScreen - Search query:', searchQuery);
    console.log('BillsScreen - Filter:', filter);
    console.log('BillsScreen - Status:', status);
    
    const filtered = bills.filter((bill: Bill) => {
      const matchesSearch = bill.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filter === 'all' || bill.type.toLowerCase() === filter;
      const matchesStatus = status === 'all' || bill.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
    
    console.log('BillsScreen - Filtered bills:', filtered.length);
    return filtered;
  }, [bills, searchQuery, filter, status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (customerId) {
      await refreshBills(customerId);
    }
    setRefreshing(false);
  };

  const handleBillPress = (bill: Bill) => {
    // Find the corresponding backend bill data
    const backendBill = backendBills.find(b => b.bill_id === bill.id);
    navigation.navigate('BillDetails', { bill, backendBill });
  };

  const handlePay = (bill: Bill) => {
    // Find the corresponding backend bill data
    const backendBill = backendBills.find(b => b.bill_id === bill.id);
    navigation.navigate('BillDetails', { bill, backendBill });
  };

  const handleDownload = (bill: Bill) => {
    console.log('Download PDF', bill.pdfUrl);
  };

  return (
    <View style={styles.container}>
      <Header title="Bills" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Searchbar placeholder="Search bills" value={searchQuery} onChangeText={setSearchQuery} style={styles.search} />
        <SegmentedButtons
          style={styles.segmented}
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'water', label: 'Water' }
          ]}
        />

        <View style={styles.chipRow}>
          {(['all', 'Paid', 'Due', 'Overdue'] as Status[]).map((item) => (
            <Chip key={item} selected={status === item} onPress={() => setStatus(item)}>
              {item}
            </Chip>
          ))}
        </View>

        <View>
          {isLoadingBills && bills.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading bills...</Text>
            </View>
          ) : billsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {billsError}</Text>
              <Button mode="outlined" onPress={() => customerId && fetchBills(customerId)}>
                Retry
              </Button>
            </View>
          ) : (
            <>
              {filteredBills.map((bill: Bill) => (
                <BillListItem 
                  key={bill.id} 
                  bill={bill} 
                  onPress={handleBillPress}
                  onPay={handlePay} 
                  onDownload={handleDownload} 
                />
              ))}
              {filteredBills.length === 0 && !isLoadingBills && (
                <Text style={styles.emptyText}>No bills found.</Text>
              )}
            </>
          )}
        </View>

        <Button mode="outlined" style={styles.button} icon="history">
          View payment history
        </Button>
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
  search: {
    borderRadius: 12
  },
  segmented: {
    marginTop: 8
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  button: {
    marginTop: 16,
    borderRadius: 12
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f'
  }
});


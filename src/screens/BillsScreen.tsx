import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Searchbar, SegmentedButtons, Text } from 'react-native-paper';
import { Header, BillListItem } from '@components';
import { useAppState } from '@hooks';
import { Bill } from '@data/mockBills';

type Filter = 'all' | 'electricity' | 'water';
type Status = 'all' | 'Paid' | 'Due' | 'Overdue';

export const BillsScreen: React.FC = () => {
  const { bills } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [status, setStatus] = useState<Status>('all');

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch = bill.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filter === 'all' || bill.type.toLowerCase() === filter;
      const matchesStatus = status === 'all' || bill.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bills, searchQuery, filter, status]);

  const handlePay = (bill: Bill) => {
    console.log('Pay bill', bill.id);
  };

  const handleDownload = (bill: Bill) => {
    console.log('Download PDF', bill.pdfUrl);
  };

  return (
    <View style={styles.container}>
      <Header title="Bills" />
      <ScrollView contentContainerStyle={styles.content}>
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
          {filteredBills.map((bill) => (
            <BillListItem key={bill.id} bill={bill} onPay={handlePay} onDownload={handleDownload} />
          ))}
          {filteredBills.length === 0 && (
            <Text style={styles.emptyText}>No bills found.</Text>
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
  }
});


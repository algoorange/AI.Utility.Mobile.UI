import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { List, Chip, IconButton, useTheme } from 'react-native-paper';
import { Bill } from '@data/mockBills';

interface BillListItemProps {
  bill: Bill;
  onPay?: (bill: Bill) => void;
  onDownload?: (bill: Bill) => void;
  onPress?: (bill: Bill) => void;
}

const statusColorMap: Record<string, string> = {
  Paid: 'secondaryContainer',
  Due: 'tertiaryContainer',
  Overdue: 'errorContainer'
};

export const BillListItem: React.FC<BillListItemProps> = ({ bill, onPay, onDownload, onPress }) => {
  const theme = useTheme();
  const chipColorKey = statusColorMap[bill.status] ?? 'secondaryContainer';
  const chipColor = (theme.colors as any)[chipColorKey];

  const handlePress = () => {
    onPress?.(bill);
  };

  const handlePayPress = (e: any) => {
    e.stopPropagation();
    onPay?.(bill);
  };

  const handleDownloadPress = (e: any) => {
    e.stopPropagation();
    onDownload?.(bill);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <List.Item
        style={styles.item}
        title={bill.account}
        description={`Due ${bill.dueDate} • $${bill.amount.toFixed(2)}`}
        left={() => (
          <List.Icon icon={bill.type === 'Electricity' ? 'flash' : 'water'} color={theme.colors.primary} />
        )}
        right={() => (
          <>
            <Chip style={[styles.chip, { backgroundColor: chipColor }]}>{bill.status}</Chip>
            {bill.status !== 'Paid' && (
              <IconButton icon="credit-card" onPress={handlePayPress} />
            )}
            <IconButton icon="download" onPress={handleDownloadPress} disabled={!bill.pdfUrl} />
          </>
        )}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: 'transparent'
  },
  chip: {
    alignSelf: 'center',
    marginRight: 8
  }
});


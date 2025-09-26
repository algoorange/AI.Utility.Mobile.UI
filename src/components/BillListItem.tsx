import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Chip, IconButton, useTheme } from 'react-native-paper';
import { Bill } from '@data/mockBills';

interface BillListItemProps {
  bill: Bill;
  onPay?: (bill: Bill) => void;
  onDownload?: (bill: Bill) => void;
}

const statusColorMap: Record<string, string> = {
  Paid: 'secondaryContainer',
  Due: 'tertiaryContainer',
  Overdue: 'errorContainer'
};

export const BillListItem: React.FC<BillListItemProps> = ({ bill, onPay, onDownload }) => {
  const theme = useTheme();
  const chipColorKey = statusColorMap[bill.status] ?? 'secondaryContainer';
  const chipColor = (theme.colors as any)[chipColorKey];

  return (
    <List.Item
      style={styles.item}
      title={bill.account}
      description={`Due ${bill.dueDate}`}
      left={() => (
        <List.Icon icon={bill.type === 'Electricity' ? 'flash' : 'water'} color={theme.colors.primary} />
      )}
      right={() => (
        <>
          <Chip style={[styles.chip, { backgroundColor: chipColor }]}>{bill.status}</Chip>
          {bill.status !== 'Paid' && (
            <IconButton icon="credit-card" onPress={() => onPay?.(bill)} />
          )}
          <IconButton icon="download" onPress={() => onDownload?.(bill)} disabled={!bill.pdfUrl} />
        </>
      )}
    />
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


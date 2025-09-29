import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Divider, 
  Chip, 
  TextInput, 
  RadioButton, 
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { Header } from '../components';
import { Bill, BackendBill } from '../data/mockBills';

interface BillDetailsScreenProps {
  route: {
    params: {
      bill: Bill;
      backendBill?: BackendBill;
    };
  };
  navigation: any;
}

type PaymentMethod = 'credit_card' | 'paynow' | 'paypal' | 'auto_debit';

export const BillDetailsScreen: React.FC<BillDetailsScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { bill, backendBill } = route.params;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async () => {
    if (bill.status === 'Paid') {
      Alert.alert('Already Paid', 'This bill has already been paid.');
      return;
    }

    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      Alert.alert(
        'Payment Successful', 
        `Payment of $${bill.amount.toFixed(2)} has been processed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return theme.colors.primary;
      case 'Due':
        return theme.colors.tertiary;
      case 'Overdue':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Bill Details" showBackButton onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Bill Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.billHeader}>
              <View style={styles.billInfo}>
                <Text variant="headlineSmall" style={styles.billId}>
                  {bill.id}
                </Text>
                <Text variant="titleMedium" style={styles.accountName}>
                  {backendBill?.customer_name || bill.account}
                </Text>
                <Chip 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(bill.status) + '20' }]}
                  textStyle={{ color: getStatusColor(bill.status) }}
                >
                  {bill.status}
                </Chip>
              </View>
              <View style={styles.amountContainer}>
                <Text variant="headlineLarge" style={[styles.amount, { color: theme.colors.primary }]}>
                  ${bill.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Bill Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Bill Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Bill ID:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>{bill.id}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Customer Name:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>{backendBill?.customer_name || bill.account}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Type:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>{bill.type}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Amount Due:</Text>
              <Text variant="bodyLarge" style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                ${bill.amount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Due Date:</Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {formatDate(bill.dueDate)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>Status:</Text>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(bill.status) + '20' }]}
                textStyle={{ color: getStatusColor(bill.status) }}
              >
                {bill.status}
              </Chip>
            </View>
            
            {backendBill && (
              <>
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Units Consumed:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {backendBill.units_consumed.toLocaleString()} {bill.type === 'Electricity' ? 'kWh' : 'Liters'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Rate per Unit:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    ${backendBill.rate_per_unit.toFixed(4)}/{bill.type === 'Electricity' ? 'kWh' : 'Liter'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Billing Period:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {backendBill.billing_period}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text variant="bodyLarge" style={styles.detailLabel}>Meter Reading:</Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {backendBill.meter_reading_start.toLocaleString()} - {backendBill.meter_reading_end.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Payment Section - Only show for unpaid bills */}
        {bill.status !== 'Paid' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Make Payment
              </Text>
              <Divider style={styles.divider} />
              
              {/* Payment Method Selection */}
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Payment Method
              </Text>
              
              <RadioButton.Group onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)} value={selectedPaymentMethod}>
                <View style={styles.radioOption}>
                  <RadioButton value="credit_card" />
                  <Text variant="bodyLarge">Credit Card</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="paynow" />
                  <Text variant="bodyLarge">PayNow</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="paypal" />
                  <Text variant="bodyLarge">PayPal</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="auto_debit" />
                  <Text variant="bodyLarge">Auto Debit</Text>
                </View>
              </RadioButton.Group>

              {/* Credit Card Details - Only show when credit card is selected */}
              {selectedPaymentMethod === 'credit_card' && (
                <View style={styles.paymentDetails}>
                  <Text variant="titleMedium" style={styles.subsectionTitle}>
                    Card Details
                  </Text>
                  
                  <TextInput
                    label="Card Number"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="1234 5678 9012 3456"
                    style={styles.input}
                  />
                  
                  <View style={styles.rowInputs}>
                    <TextInput
                      label="Expiry Date"
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      mode="outlined"
                      placeholder="MM/YY"
                      style={[styles.input, styles.halfInput]}
                    />
                    <TextInput
                      label="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      mode="outlined"
                      keyboardType="numeric"
                      placeholder="123"
                      style={[styles.input, styles.halfInput]}
                      secureTextEntry
                    />
                  </View>
                </View>
              )}

              {/* Payment Summary */}
              <View style={styles.paymentSummary}>
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text variant="titleMedium">Amount to Pay:</Text>
                  <Text variant="titleLarge" style={[styles.summaryAmount, { color: theme.colors.primary }]}>
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Pay Button */}
              <Button
                mode="contained"
                onPress={handlePayment}
                disabled={isProcessingPayment}
                style={styles.payButton}
                contentStyle={styles.payButtonContent}
              >
                {isProcessingPayment ? (
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  `Pay $${bill.amount.toFixed(2)}`
                )}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Download PDF Button */}
        {bill.pdfUrl && (
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Download', 'PDF download functionality would be implemented here.')}
            style={styles.downloadButton}
            icon="download"
          >
            Download PDF
          </Button>
        )}
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
    borderRadius: 16,
    elevation: 2
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  billInfo: {
    flex: 1
  },
  billId: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  accountName: {
    marginBottom: 8,
    opacity: 0.8
  },
  amountContainer: {
    alignItems: 'flex-end'
  },
  amount: {
    fontWeight: 'bold'
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold'
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600'
  },
  divider: {
    marginVertical: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  detailLabel: {
    flex: 1,
    opacity: 0.7
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '500'
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  paymentDetails: {
    marginTop: 16
  },
  input: {
    marginBottom: 12
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1
  },
  paymentSummary: {
    marginTop: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  summaryAmount: {
    fontWeight: 'bold'
  },
  payButton: {
    marginTop: 20,
    borderRadius: 12
  },
  payButtonContent: {
    paddingVertical: 8
  },
  downloadButton: {
    borderRadius: 12,
    marginTop: 8
  }
});

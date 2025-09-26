import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, DataTable, Text } from 'react-native-paper';
import { Header, ConsumptionChart, InfoCard } from '@components';
import { useAppState } from '@hooks';

export const UsageScreen: React.FC = () => {
  const { consumption } = useAppState();

  const totalElectricity = consumption.reduce((sum, record) => sum + record.electricity, 0);
  const totalWater = consumption.reduce((sum, record) => sum + record.water, 0);

  return (
    <View style={styles.container}>
      <Header title="Usage" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Usage Trends</Text>
            <ConsumptionChart data={consumption} />
          </Card.Content>
        </Card>

        <View style={styles.infoRow}>
          <InfoCard label="Total kWh" value={`${totalElectricity} kWh`} />
          <InfoCard label="Total Water" value={`${totalWater.toFixed(1)} m³`} accent />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.tableTitle}>
              Monthly Breakdown
            </Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Month</DataTable.Title>
                <DataTable.Title numeric>Electricity</DataTable.Title>
                <DataTable.Title numeric>Water</DataTable.Title>
              </DataTable.Header>

              {consumption.map((record) => (
                <DataTable.Row key={record.month}>
                  <DataTable.Cell>{record.month}</DataTable.Cell>
                  <DataTable.Cell numeric>{record.electricity} kWh</DataTable.Cell>
                  <DataTable.Cell numeric>{record.water} m³</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
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
  infoRow: {
    flexDirection: 'row',
    gap: 16
  },
  tableTitle: {
    marginBottom: 16
  }
});


import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface InfoCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, accent }) => {
  const theme = useTheme();
  const backgroundColor = accent ? theme.colors.primaryContainer : theme.colors.surfaceVariant;
  const color = accent ? theme.colors.onPrimaryContainer : theme.colors.onSurface;

  return (
    <View style={[styles.card, { backgroundColor }]}> 
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text variant="headlineSmall" style={{ color }}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  label: {
    marginBottom: 8,
    fontWeight: '600'
  }
});


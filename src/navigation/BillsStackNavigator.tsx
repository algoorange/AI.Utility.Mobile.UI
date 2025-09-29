import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BillsScreen } from '../screens/BillsScreen';
import { BillDetailsScreen } from '../screens/BillDetailsScreen';

export type BillsStackParamList = {
  BillsList: undefined;
  BillDetails: {
    bill: any; // Bill type from mockBills
    backendBill?: any; // BackendBill type from mockBills
  };
};

const Stack = createStackNavigator<BillsStackParamList>();

export const BillsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BillsList" component={BillsScreen} />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
    </Stack.Navigator>
  );
};

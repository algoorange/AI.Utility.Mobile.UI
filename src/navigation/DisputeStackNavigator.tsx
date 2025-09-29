import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DisputeScreen } from '../screens/DisputeScreen';
import { DisputeDetailsScreen } from '../screens/DisputeDetailsScreen';

export type DisputeStackParamList = {
  DisputeList: undefined;
  DisputeDetails: {
    dispute: any; // Dispute type from mockBills
    backendDispute?: any; // BackendDispute type from mockBills
  };
};

const Stack = createStackNavigator<DisputeStackParamList>();

export const DisputeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DisputeList" component={DisputeScreen} />
      <Stack.Screen name="DisputeDetails" component={DisputeDetailsScreen} />
    </Stack.Navigator>
  );
};

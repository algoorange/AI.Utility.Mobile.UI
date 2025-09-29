import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SupportScreen } from '../screens';

export type SupportStackParamList = {
  SupportList: undefined;
};

const Stack = createStackNavigator<SupportStackParamList>();

export const SupportStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SupportList" component={SupportScreen} />
    </Stack.Navigator>
  );
};

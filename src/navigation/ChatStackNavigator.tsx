import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatScreen } from '../screens';

export type ChatStackParamList = {
  Chat: undefined;
};

const Stack = createStackNavigator<ChatStackParamList>();

export const ChatStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

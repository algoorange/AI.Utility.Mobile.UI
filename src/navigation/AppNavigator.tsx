import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import {
  DashboardScreen,
  BillsScreen,
  MeterScreen,
  UsageScreen,
  SupportScreen,
  DisputeScreen,
  ProfileScreen
} from '@screens';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type RootTabParamList = {
  Dashboard: undefined;
  Bills: undefined;
  Dispute: undefined;
  Meter: undefined;
  Usage: undefined;
  Support: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator: React.FC = () => {
  const paperTheme = useTheme();
  const navigationTheme = paperTheme.dark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={{
      ...navigationTheme,
      colors: {
        ...navigationTheme.colors,
        background: paperTheme.colors.background,
        card: paperTheme.colors.surface,
        primary: paperTheme.colors.primary,
        text: paperTheme.colors.onSurface,
        border: paperTheme.colors.outline
      }
    }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: paperTheme.colors.primary,
          tabBarInactiveTintColor: paperTheme.colors.outline,
          tabBarStyle: {
            backgroundColor: paperTheme.colors.surface,
            borderTopWidth: 0,
            paddingBottom: 6,
            height: 70
          },
          tabBarIcon: ({ color, size }) => {
            const iconMap: Record<keyof RootTabParamList, string> = {
              Dashboard: 'view-dashboard-outline',
              Bills: 'receipt-text-outline',
              Dispute: 'alert-octagon-outline',
              Meter: 'camera-metering-matrix',
              Usage: 'chart-line',
              Support: 'account-question-outline',
              Profile: 'account-circle-outline'
            };
            const iconName = iconMap[route.name as keyof RootTabParamList];
            return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Bills" component={BillsScreen} />
        <Tab.Screen name="Dispute" component={DisputeScreen} />
        <Tab.Screen name="Meter" component={MeterScreen} />
        <Tab.Screen name="Usage" component={UsageScreen} />
        <Tab.Screen name="Support" component={SupportScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};


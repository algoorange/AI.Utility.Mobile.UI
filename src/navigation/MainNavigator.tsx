import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useAppState } from '../hooks';
import { AuthStackNavigator } from './AuthStackNavigator';
import { AppNavigator } from './AppNavigator';

export const MainNavigator: React.FC = () => {
  const { isAuthenticated } = useAppState();
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
      {isAuthenticated ? <AppNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

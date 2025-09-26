import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Switch, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '@hooks';

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, right, canGoBack }) => {
  const { isDark, toggleTheme } = useThemeMode();
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Appbar.Header elevated>
      {canGoBack && <Appbar.BackAction color={theme.colors.onSurface} onPress={navigation.goBack} />}
      <Appbar.Content title={title} titleStyle={{ color: theme.colors.onSurface }} />
      <View style={styles.switchContainer}>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      {right}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    marginRight: 8
  }
});


import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Switch, useTheme } from 'react-native-paper';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useThemeMode } from '@hooks';

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  canGoBack?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, right, canGoBack }) => {
  const { isDark, toggleTheme } = useThemeMode();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const theme = useTheme();
  const showBack = canGoBack ?? navigation.canGoBack();

  const handleBack = useCallback(() => {
    if (!canGoBack && !navigation.canGoBack()) {
      return;
    }

    navigation.goBack();
  }, [canGoBack, navigation]);

  return (
    <Appbar.Header elevated>
      {showBack && <Appbar.BackAction color={theme.colors.onSurface} onPress={handleBack} />}
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


import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  bodyLarge: { fontFamily: 'System', fontWeight: '400' },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' },
  bodySmall: { fontFamily: 'System', fontWeight: '400' },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' },
  titleLarge: { fontFamily: 'System', fontWeight: '600' },
  titleMedium: { fontFamily: 'System', fontWeight: '500' },
  titleSmall: { fontFamily: 'System', fontWeight: '500' },
  labelLarge: { fontFamily: 'System', fontWeight: '500' }
};

const sharedColors = {
  primary: '#0066CC',
  secondary: '#00A86B',
  tertiary: '#FFC107',
  surface: '#F5F7FA',
  surfaceDisabled: '#DFE3EB',
  onSurface: '#1A1E26',
  background: '#F5F7FA'
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    ...sharedColors,
    surfaceVariant: '#E1E6ED',
    outline: '#8892A0'
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#66B2FF',
    secondary: '#4CD19E',
    tertiary: '#FFC107',
    surface: '#1A1E26',
    surfaceVariant: '#262B34',
    outline: '#5D6470',
    background: '#121212'
  }
};


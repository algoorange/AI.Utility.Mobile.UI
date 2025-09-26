import React, { useEffect } from 'react';
import { Audio } from 'expo-av';
import { ThemeProvider } from '@providers/ThemeProvider';
import { AppStateProvider } from '@providers/AppStateProvider';
import { AppNavigator } from '@navigation';

const App: React.FC = () => {
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => undefined);
  }, []);

  return (
    <ThemeProvider>
      <AppStateProvider>
        <AppNavigator />
      </AppStateProvider>
    </ThemeProvider>
  );
};

export default App;


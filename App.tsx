import React from 'react';
import { ThemeProvider } from '@providers/ThemeProvider';
import { AppStateProvider } from '@providers/AppStateProvider';
import { AppNavigator } from '@navigation';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <AppNavigator />
      </AppStateProvider>
    </ThemeProvider>
  );
};

export default App;


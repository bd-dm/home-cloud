import type {FC} from 'react';
import React from 'react';
import {Navigator} from './navigator';
import {AuthContextProvider} from './contexts';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const App: FC = () => {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <StatusBar />
        <Navigator />
      </AuthContextProvider>
    </SafeAreaProvider>
  );
};

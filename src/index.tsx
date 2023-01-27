import React, {FC} from 'react';
import {Navigator} from './navigator';
import {AuthContextProvider} from './contexts';
import {StatusBar} from 'react-native';

export const App: FC = () => {
  return (
    <AuthContextProvider>
      <StatusBar barStyle={'dark-content'} />
      <Navigator />
    </AuthContextProvider>
  );
};

import type {FC} from 'react';
import React from 'react';
import {RollPage} from './pages';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthContext} from './contexts';
import {LoginPage} from './pages';

const Stack = createNativeStackNavigator();

export const Navigator: FC = () => {
  const {isAuthorized} = useAuthContext();

  return (
    <NavigationContainer>
      {isAuthorized ? (
        <Stack.Navigator initialRouteName={'Roll'}>
          <Stack.Screen name="Roll" component={RollPage} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName={'Login'}>
          <Stack.Screen name="Login" component={LoginPage} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

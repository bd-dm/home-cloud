import type {FC} from 'react';
import React from 'react';
import {RollPage} from './pages';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthContext} from './contexts';
import {LoginPage} from './pages';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PlatformColor, View} from 'react-native';

const Stack = createNativeStackNavigator();

export const Navigator: FC = () => {
  const {isAuthorized} = useAuthContext();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: PlatformColor('systemBackground'),
      }}>
      <NavigationContainer>
        {isAuthorized ? (
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName={'Roll'}>
            <Stack.Screen name="Roll" component={RollPage} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName={'Login'}>
            <Stack.Screen name="Login" component={LoginPage} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
};

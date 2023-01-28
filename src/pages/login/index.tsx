import type {FC} from 'react';
import React from 'react';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {View} from 'react-native';
import {useAuthContext} from '../../contexts';
import {authApi} from '../../api';

export const LoginPage: FC = () => {
  const {setToken} = useAuthContext();

  const onAppleButtonPress = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    if (
      credentialState === appleAuth.State.AUTHORIZED &&
      appleAuthRequestResponse.authorizationCode
    ) {
      const response = await authApi.authControllerApple({
        code: appleAuthRequestResponse.authorizationCode,
      });

      if (response?.accessToken) {
        setToken(response.accessToken);
      }
    }
  };

  return (
    <View>
      <AppleButton
        buttonStyle={AppleButton.Style.WHITE}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
          width: 160,
          height: 45,
        }}
        onPress={() => onAppleButtonPress()}
      />
    </View>
  );
};

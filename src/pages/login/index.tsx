import React, {FC} from 'react';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {View} from 'react-native';
import {config} from '../../config';
import {useAuthContext} from '../../contexts';

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

    if (credentialState === appleAuth.State.AUTHORIZED) {
      const user = await fetch(`${config.api.host}/auth/apple`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: appleAuthRequestResponse.authorizationCode,
        }),
      }).then(response => response.json());

      if (user?.accessToken) {
        setToken(user.accessToken);
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

import type {FC} from 'react';
import React from 'react';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {ActivityIndicator, PlatformColor, View} from 'react-native';
import {useAuthContext} from '../../contexts';
import {authApi} from '../../api';

export const LoginPage: FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {setToken} = useAuthContext();

  const onAppleButtonPress = async () => {
    try {
      setIsLoading(true);
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
          await setToken(response.accessToken);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: PlatformColor('systemBackground'),
      }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <AppleButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          style={{
            width: 160,
            height: 45,
          }}
          onPress={() => onAppleButtonPress()}
        />
      )}
    </View>
  );
};

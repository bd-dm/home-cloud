import React, {FC} from 'react';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {View} from 'react-native';

export const LoginPage: FC = () => {
  const onAppleButtonPress = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    if (credentialState === appleAuth.State.AUTHORIZED) {
      // log user data
      console.log(appleAuthRequestResponse);
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

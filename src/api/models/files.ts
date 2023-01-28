import {createConfiguration, FilesApi, ServerConfiguration} from '../generated';
import {config} from '../../config';
import EncryptedStorage from 'react-native-encrypted-storage';

const serverConfig = new ServerConfiguration(config.api.host, {});
const apiConfig = createConfiguration({
  baseServer: serverConfig,
  authMethods: {
    bearer: {
      tokenProvider: {
        getToken: async () => {
          const token = await EncryptedStorage.getItem('token');

          if (token) {
            return token;
          } else {
            return '';
          }
        },
      },
    },
  },
});

const filesApi = new FilesApi(apiConfig);

export {filesApi};

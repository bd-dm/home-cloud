import {createConfiguration, AuthApi, ServerConfiguration} from '../generated';
import {config} from '../../config';

const serverConfig = new ServerConfiguration(config.api.host, {});
const apiConfig = createConfiguration({
  baseServer: serverConfig,
});

const authApi = new AuthApi(apiConfig);

export {authApi};

import {createConfiguration, FilesApi, ServerConfiguration} from '../generated';
import {config} from '../../config';

const serverConfig = new ServerConfiguration(config.api.host, {});
const apiConfig = createConfiguration({
  baseServer: serverConfig,
});

const filesApi = new FilesApi(apiConfig);

export {filesApi};

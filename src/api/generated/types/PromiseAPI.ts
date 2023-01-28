import {ResponseContext, RequestContext, HttpFile} from '../http/http';
import type {Configuration} from '../configuration';

import type {AppleAuthRequestDto} from '../models/AppleAuthRequestDto';
import type {AppleAuthResponseDto} from '../models/AppleAuthResponseDto';
import type {CreateFileResponseDto} from '../models/CreateFileResponseDto';
import {ObservableAuthApi} from './ObservableAPI';

import type {
  AuthApiRequestFactory,
  AuthApiResponseProcessor,
} from '../apis/AuthApi';
export class PromiseAuthApi {
  private api: ObservableAuthApi;

  public constructor(
    configuration: Configuration,
    requestFactory?: AuthApiRequestFactory,
    responseProcessor?: AuthApiResponseProcessor,
  ) {
    this.api = new ObservableAuthApi(
      configuration,
      requestFactory,
      responseProcessor,
    );
  }

  /**
   * @param appleAuthRequestDto
   */
  public authControllerApple(
    appleAuthRequestDto: AppleAuthRequestDto,
    _options?: Configuration,
  ): Promise<AppleAuthResponseDto> {
    const result = this.api.authControllerApple(appleAuthRequestDto, _options);
    return result.toPromise();
  }
}

import {ObservableFilesApi} from './ObservableAPI';

import type {
  FilesApiRequestFactory,
  FilesApiResponseProcessor,
} from '../apis/FilesApi';
export class PromiseFilesApi {
  private api: ObservableFilesApi;

  public constructor(
    configuration: Configuration,
    requestFactory?: FilesApiRequestFactory,
    responseProcessor?: FilesApiResponseProcessor,
  ) {
    this.api = new ObservableFilesApi(
      configuration,
      requestFactory,
      responseProcessor,
    );
  }

  /**
   * @param body
   */
  public filesControllerCreate(
    body: any,
    _options?: Configuration,
  ): Promise<CreateFileResponseDto> {
    const result = this.api.filesControllerCreate(body, _options);
    return result.toPromise();
  }

  /**
   */
  public filesControllerFindAll(
    _options?: Configuration,
  ): Promise<Array<CreateFileResponseDto>> {
    const result = this.api.filesControllerFindAll(_options);
    return result.toPromise();
  }
}

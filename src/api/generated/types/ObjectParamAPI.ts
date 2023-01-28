import {ResponseContext, RequestContext, HttpFile} from '../http/http';
import type {Configuration} from '../configuration';

import type {AppleAuthRequestDto} from '../models/AppleAuthRequestDto';
import type {AppleAuthResponseDto} from '../models/AppleAuthResponseDto';
import type {FileResponseDto} from '../models/FileResponseDto';

import {ObservableAuthApi} from './ObservableAPI';
import type {
  AuthApiRequestFactory,
  AuthApiResponseProcessor,
} from '../apis/AuthApi';

export interface AuthApiAuthControllerAppleRequest {
  /**
   *
   * @type AppleAuthRequestDto
   * @memberof AuthApiauthControllerApple
   */
  appleAuthRequestDto: AppleAuthRequestDto;
}

export class ObjectAuthApi {
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
   * @param param the request object
   */
  public authControllerApple(
    param: AuthApiAuthControllerAppleRequest,
    options?: Configuration,
  ): Promise<AppleAuthResponseDto> {
    return this.api
      .authControllerApple(param.appleAuthRequestDto, options)
      .toPromise();
  }
}

import {ObservableFilesApi} from './ObservableAPI';
import type {
  FilesApiRequestFactory,
  FilesApiResponseProcessor,
} from '../apis/FilesApi';

export interface FilesApiFilesControllerCreateRequest {
  /**
   *
   * @type any
   * @memberof FilesApifilesControllerCreate
   */
  body: any;
}

export interface FilesApiFilesControllerFindAllRequest {}

export class ObjectFilesApi {
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
   * @param param the request object
   */
  public filesControllerCreate(
    param: FilesApiFilesControllerCreateRequest,
    options?: Configuration,
  ): Promise<FileResponseDto> {
    return this.api.filesControllerCreate(param.body, options).toPromise();
  }

  /**
   * @param param the request object
   */
  public filesControllerFindAll(
    param: FilesApiFilesControllerFindAllRequest = {},
    options?: Configuration,
  ): Promise<Array<FileResponseDto>> {
    return this.api.filesControllerFindAll(options).toPromise();
  }
}

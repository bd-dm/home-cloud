// TODO: better import syntax?
import {
  BaseAPIRequestFactory,
  RequiredError,
  COLLECTION_FORMATS,
} from './baseapi';
import type {Configuration} from '../configuration';
import type {RequestContext, ResponseContext} from '../http/http';
import {HttpMethod, HttpFile} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import type {SecurityAuthentication} from '../auth/auth';

import type {FileResponseDto} from '../models/FileResponseDto';

/**
 * no description
 */
export class FilesApiRequestFactory extends BaseAPIRequestFactory {
  /**
   * @param body
   */
  public async filesControllerCreate(
    body: any,
    _options?: Configuration,
  ): Promise<RequestContext> {
    let _config = _options || this.configuration;

    // verify required parameter 'body' is not null or undefined
    if (body === null || body === undefined) {
      throw new RequiredError('FilesApi', 'filesControllerCreate', 'body');
    }

    // Path Params
    const localVarPath = '/files';

    // Make Request Context
    const requestContext = _config.baseServer.makeRequestContext(
      localVarPath,
      HttpMethod.POST,
    );
    requestContext.setHeaderParam('Accept', 'application/json, */*;q=0.8');

    // Body Params
    const contentType = ObjectSerializer.getPreferredMediaType([
      'application/octet-stream',
    ]);
    requestContext.setHeaderParam('Content-Type', contentType);
    const serializedBody = ObjectSerializer.stringify(
      ObjectSerializer.serialize(body, 'any', ''),
      contentType,
    );
    requestContext.setBody(serializedBody);

    let authMethod: SecurityAuthentication | undefined;
    // Apply auth methods
    authMethod = _config.authMethods.bearer;
    if (authMethod?.applySecurityAuthentication) {
      await authMethod?.applySecurityAuthentication(requestContext);
    }

    const defaultAuth: SecurityAuthentication | undefined =
      _options?.authMethods?.default ||
      this.configuration?.authMethods?.default;
    if (defaultAuth?.applySecurityAuthentication) {
      await defaultAuth?.applySecurityAuthentication(requestContext);
    }

    return requestContext;
  }

  /**
   */
  public async filesControllerFindAll(
    _options?: Configuration,
  ): Promise<RequestContext> {
    let _config = _options || this.configuration;

    // Path Params
    const localVarPath = '/files';

    // Make Request Context
    const requestContext = _config.baseServer.makeRequestContext(
      localVarPath,
      HttpMethod.GET,
    );
    requestContext.setHeaderParam('Accept', 'application/json, */*;q=0.8');

    let authMethod: SecurityAuthentication | undefined;
    // Apply auth methods
    authMethod = _config.authMethods.bearer;
    if (authMethod?.applySecurityAuthentication) {
      await authMethod?.applySecurityAuthentication(requestContext);
    }

    const defaultAuth: SecurityAuthentication | undefined =
      _options?.authMethods?.default ||
      this.configuration?.authMethods?.default;
    if (defaultAuth?.applySecurityAuthentication) {
      await defaultAuth?.applySecurityAuthentication(requestContext);
    }

    return requestContext;
  }
}

export class FilesApiResponseProcessor {
  /**
   * Unwraps the actual response sent by the server from the response context and deserializes the response content
   * to the expected objects
   *
   * @params response Response returned by the server for a request to filesControllerCreate
   * @throws ApiException if the response code was not in [200, 299]
   */
  public async filesControllerCreate(
    response: ResponseContext,
  ): Promise<FileResponseDto> {
    const contentType = ObjectSerializer.normalizeMediaType(
      response.headers['content-type'],
    );
    if (isCodeInRange('200', response.httpStatusCode)) {
      const body: FileResponseDto = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'FileResponseDto',
        '',
      ) as FileResponseDto;
      return body;
    }

    // Work around for missing responses in specification, e.g. for petstore.yaml
    if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
      const body: FileResponseDto = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'FileResponseDto',
        '',
      ) as FileResponseDto;
      return body;
    }

    throw new ApiException<string | Blob | undefined>(
      response.httpStatusCode,
      'Unknown API Status Code!',
      await response.getBodyAsAny(),
      response.headers,
    );
  }

  /**
   * Unwraps the actual response sent by the server from the response context and deserializes the response content
   * to the expected objects
   *
   * @params response Response returned by the server for a request to filesControllerFindAll
   * @throws ApiException if the response code was not in [200, 299]
   */
  public async filesControllerFindAll(
    response: ResponseContext,
  ): Promise<Array<FileResponseDto>> {
    const contentType = ObjectSerializer.normalizeMediaType(
      response.headers['content-type'],
    );
    if (isCodeInRange('200', response.httpStatusCode)) {
      const body: Array<FileResponseDto> = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'Array<FileResponseDto>',
        '',
      ) as Array<FileResponseDto>;
      return body;
    }

    // Work around for missing responses in specification, e.g. for petstore.yaml
    if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
      const body: Array<FileResponseDto> = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'Array<FileResponseDto>',
        '',
      ) as Array<FileResponseDto>;
      return body;
    }

    throw new ApiException<string | Blob | undefined>(
      response.httpStatusCode,
      'Unknown API Status Code!',
      await response.getBodyAsAny(),
      response.headers,
    );
  }
}

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

import type {AppleAuthRequestDto} from '../models/AppleAuthRequestDto';
import type {AppleAuthResponseDto} from '../models/AppleAuthResponseDto';

/**
 * no description
 */
export class AuthApiRequestFactory extends BaseAPIRequestFactory {
  /**
   * @param appleAuthRequestDto
   */
  public async authControllerApple(
    appleAuthRequestDto: AppleAuthRequestDto,
    _options?: Configuration,
  ): Promise<RequestContext> {
    let _config = _options || this.configuration;

    // verify required parameter 'appleAuthRequestDto' is not null or undefined
    if (appleAuthRequestDto === null || appleAuthRequestDto === undefined) {
      throw new RequiredError(
        'AuthApi',
        'authControllerApple',
        'appleAuthRequestDto',
      );
    }

    // Path Params
    const localVarPath = '/auth/apple';

    // Make Request Context
    const requestContext = _config.baseServer.makeRequestContext(
      localVarPath,
      HttpMethod.POST,
    );
    requestContext.setHeaderParam('Accept', 'application/json, */*;q=0.8');

    // Body Params
    const contentType = ObjectSerializer.getPreferredMediaType([
      'application/json',
    ]);
    requestContext.setHeaderParam('Content-Type', contentType);
    const serializedBody = ObjectSerializer.stringify(
      ObjectSerializer.serialize(
        appleAuthRequestDto,
        'AppleAuthRequestDto',
        '',
      ),
      contentType,
    );
    requestContext.setBody(serializedBody);

    const defaultAuth: SecurityAuthentication | undefined =
      _options?.authMethods?.default ||
      this.configuration?.authMethods?.default;
    if (defaultAuth?.applySecurityAuthentication) {
      await defaultAuth?.applySecurityAuthentication(requestContext);
    }

    return requestContext;
  }
}

export class AuthApiResponseProcessor {
  /**
   * Unwraps the actual response sent by the server from the response context and deserializes the response content
   * to the expected objects
   *
   * @params response Response returned by the server for a request to authControllerApple
   * @throws ApiException if the response code was not in [200, 299]
   */
  public async authControllerApple(
    response: ResponseContext,
  ): Promise<AppleAuthResponseDto> {
    const contentType = ObjectSerializer.normalizeMediaType(
      response.headers['content-type'],
    );
    if (isCodeInRange('200', response.httpStatusCode)) {
      const body: AppleAuthResponseDto = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'AppleAuthResponseDto',
        '',
      ) as AppleAuthResponseDto;
      return body;
    }

    // Work around for missing responses in specification, e.g. for petstore.yaml
    if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
      const body: AppleAuthResponseDto = ObjectSerializer.deserialize(
        ObjectSerializer.parse(await response.body.text(), contentType),
        'AppleAuthResponseDto',
        '',
      ) as AppleAuthResponseDto;
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

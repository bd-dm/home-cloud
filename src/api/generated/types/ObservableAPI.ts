import type {ResponseContext, RequestContext} from '../http/http';
import {HttpFile} from '../http/http';
import type {Configuration} from '../configuration';
import type {Observable} from '../rxjsStub';
import {of, from} from '../rxjsStub';
import {mergeMap, map} from '../rxjsStub';
import type {AppleAuthRequestDto} from '../models/AppleAuthRequestDto';
import type {AppleAuthResponseDto} from '../models/AppleAuthResponseDto';
import type {FileResponseDto} from '../models/FileResponseDto';

import {AuthApiRequestFactory, AuthApiResponseProcessor} from '../apis/AuthApi';
export class ObservableAuthApi {
  private requestFactory: AuthApiRequestFactory;
  private responseProcessor: AuthApiResponseProcessor;
  private configuration: Configuration;

  public constructor(
    configuration: Configuration,
    requestFactory?: AuthApiRequestFactory,
    responseProcessor?: AuthApiResponseProcessor,
  ) {
    this.configuration = configuration;
    this.requestFactory =
      requestFactory || new AuthApiRequestFactory(configuration);
    this.responseProcessor =
      responseProcessor || new AuthApiResponseProcessor();
  }

  /**
   * @param appleAuthRequestDto
   */
  public authControllerApple(
    appleAuthRequestDto: AppleAuthRequestDto,
    _options?: Configuration,
  ): Observable<AppleAuthResponseDto> {
    const requestContextPromise = this.requestFactory.authControllerApple(
      appleAuthRequestDto,
      _options,
    );

    // build promise chain
    let middlewarePreObservable = from<RequestContext>(requestContextPromise);
    for (let middleware of this.configuration.middleware) {
      middlewarePreObservable = middlewarePreObservable.pipe(
        mergeMap((ctx: RequestContext) => middleware.pre(ctx)),
      );
    }

    return middlewarePreObservable
      .pipe(
        mergeMap((ctx: RequestContext) => this.configuration.httpApi.send(ctx)),
      )
      .pipe(
        mergeMap((response: ResponseContext) => {
          let middlewarePostObservable = of(response);
          for (let middleware of this.configuration.middleware) {
            middlewarePostObservable = middlewarePostObservable.pipe(
              mergeMap((rsp: ResponseContext) => middleware.post(rsp)),
            );
          }
          return middlewarePostObservable.pipe(
            map((rsp: ResponseContext) =>
              this.responseProcessor.authControllerApple(rsp),
            ),
          );
        }),
      );
  }
}

import {
  FilesApiRequestFactory,
  FilesApiResponseProcessor,
} from '../apis/FilesApi';
export class ObservableFilesApi {
  private requestFactory: FilesApiRequestFactory;
  private responseProcessor: FilesApiResponseProcessor;
  private configuration: Configuration;

  public constructor(
    configuration: Configuration,
    requestFactory?: FilesApiRequestFactory,
    responseProcessor?: FilesApiResponseProcessor,
  ) {
    this.configuration = configuration;
    this.requestFactory =
      requestFactory || new FilesApiRequestFactory(configuration);
    this.responseProcessor =
      responseProcessor || new FilesApiResponseProcessor();
  }

  /**
   * @param body
   */
  public filesControllerCreate(
    body: any,
    _options?: Configuration,
  ): Observable<FileResponseDto> {
    const requestContextPromise = this.requestFactory.filesControllerCreate(
      body,
      _options,
    );

    // build promise chain
    let middlewarePreObservable = from<RequestContext>(requestContextPromise);
    for (let middleware of this.configuration.middleware) {
      middlewarePreObservable = middlewarePreObservable.pipe(
        mergeMap((ctx: RequestContext) => middleware.pre(ctx)),
      );
    }

    return middlewarePreObservable
      .pipe(
        mergeMap((ctx: RequestContext) => this.configuration.httpApi.send(ctx)),
      )
      .pipe(
        mergeMap((response: ResponseContext) => {
          let middlewarePostObservable = of(response);
          for (let middleware of this.configuration.middleware) {
            middlewarePostObservable = middlewarePostObservable.pipe(
              mergeMap((rsp: ResponseContext) => middleware.post(rsp)),
            );
          }
          return middlewarePostObservable.pipe(
            map((rsp: ResponseContext) =>
              this.responseProcessor.filesControllerCreate(rsp),
            ),
          );
        }),
      );
  }

  /**
   */
  public filesControllerFindAll(
    _options?: Configuration,
  ): Observable<Array<FileResponseDto>> {
    const requestContextPromise =
      this.requestFactory.filesControllerFindAll(_options);

    // build promise chain
    let middlewarePreObservable = from<RequestContext>(requestContextPromise);
    for (let middleware of this.configuration.middleware) {
      middlewarePreObservable = middlewarePreObservable.pipe(
        mergeMap((ctx: RequestContext) => middleware.pre(ctx)),
      );
    }

    return middlewarePreObservable
      .pipe(
        mergeMap((ctx: RequestContext) => this.configuration.httpApi.send(ctx)),
      )
      .pipe(
        mergeMap((response: ResponseContext) => {
          let middlewarePostObservable = of(response);
          for (let middleware of this.configuration.middleware) {
            middlewarePostObservable = middlewarePostObservable.pipe(
              mergeMap((rsp: ResponseContext) => middleware.post(rsp)),
            );
          }
          return middlewarePostObservable.pipe(
            map((rsp: ResponseContext) =>
              this.responseProcessor.filesControllerFindAll(rsp),
            ),
          );
        }),
      );
  }
}

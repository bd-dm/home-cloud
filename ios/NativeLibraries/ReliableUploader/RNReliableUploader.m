#import <Foundation/Foundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import <Photos/Photos.h>
#import "RNReliableUploader.h"

@implementation RNReliableUploader {
  unsigned long _uploadId;
  NSMutableDictionary *_responsesData;
  NSURLSession *_urlSession;

  void (^backgroundSessionCompletionHandler)(void);
}

RCT_EXPORT_MODULE(RNReliableUploader);

static NSString *BACKGROUND_SESSION_ID = @"RNReliableUploader";
static RNReliableUploader *sharedInstance;

#pragma Init
  - (id) initPrivate {
    if (self = [super init]) {
      _uploadId = 0;
      _responsesData = [NSMutableDictionary dictionary];
      _urlSession = nil;
      backgroundSessionCompletionHandler = nil;
      self.isObserving = NO;
    }
    return self;
  }

  - (id) init {
    return [RNReliableUploader sharedInstance];
  }

#pragma Helpers
  + (BOOL) requiresMainQueueSetup {
    return YES;
  }

  + (RNReliableUploader*) sharedInstance {
    @synchronized(self) {
      if (sharedInstance == nil) {
        sharedInstance = [[self alloc] initPrivate];
      }
    }
    return sharedInstance;
  }

  - (dispatch_queue_t) methodQueue {
    return dispatch_get_main_queue();
  }

  - (void) _sendEventWithName:(NSString *) eventName body:(id) body {
    double delayInSeconds = 0.5;
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);

    dispatch_after(popTime, dispatch_get_main_queue(), ^(void) {
      if (self.bridge != nil) {
        [self sendEventWithName:eventName body:body];
      }
    });
  }

  - (NSArray<NSString *> *) supportedEvents {
    return @[
      @"RNReliableUploader-ProgressUpdated",
      @"RNReliableUploader-Error",
      @"RNReliableUploader-Completed",
      @"RNReliableUploader-Cancelled",
      @"RNReliableUploader-Expired"
    ];
  }

  - (void) startObserving {
    self.isObserving = YES;

    [self urlSession];
  }

  - (void) stopObserving {
    self.isObserving = NO;
  }

  - (void) setBackgroundSessionCompletionHandler:(void (^)(void))handler {
    @synchronized (self) {
      backgroundSessionCompletionHandler = handler;
    }
  }

  - (NSString *) guessMIMETypeFromFileName:(NSString *) fileName {
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (__bridge CFStringRef)[fileName pathExtension], NULL);
    CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
    CFRelease(UTI);

    if (!MIMEType) {
      return @"application/octet-stream";
    }

    NSString *dest = [NSString stringWithString:(__bridge NSString *)(MIMEType)];
    CFRelease(MIMEType);
    
    return dest;
  }

  - (void) copyAssetToFile: (NSString *)assetUrl completionHandler: (void(^)(NSString *__nullable tempFileUrl, NSError *__nullable error))completionHandler {
    NSURL *url = [NSURL URLWithString:assetUrl];
    PHAsset *asset = [PHAsset fetchAssetsWithALAssetURLs:@[url] options:nil].lastObject;
    if (!asset) {
      NSMutableDictionary* details = [NSMutableDictionary dictionary];
      [details setValue:@"Asset could not be fetched.  Are you missing permissions?" forKey:NSLocalizedDescriptionKey];
      completionHandler(nil,  [NSError errorWithDomain:@"RNUploader" code:5 userInfo:details]);
      return;
    }
    PHAssetResource *assetResource = [[PHAssetResource assetResourcesForAsset:asset] firstObject];
    NSString *pathToWrite = [NSTemporaryDirectory() stringByAppendingPathComponent:[[NSUUID UUID] UUIDString]];
    NSURL *pathUrl = [NSURL fileURLWithPath:pathToWrite];
    NSString *fileURI = pathUrl.absoluteString;

    PHAssetResourceRequestOptions *options = [PHAssetResourceRequestOptions new];
    options.networkAccessAllowed = YES;

    [[PHAssetResourceManager defaultManager] writeDataForAssetResource:assetResource toFile:pathUrl options:options completionHandler:^(NSError * _Nullable e) {
      if (e == nil) {
        completionHandler(fileURI, nil);
      }
      else {
        completionHandler(nil, e);
      }
    }];
  }

  - (NSData *) createBodyWithBoundary:(NSString *)uuidStr
    filePath: (NSString *)filePath
    parameters: (NSDictionary *)parameters
    field: (NSString *)field 
  {
    NSMutableData *httpBody = [NSMutableData data];

    [parameters enumerateKeysAndObjectsUsingBlock:^(NSString *parameterKey, NSString *parameterValue, BOOL *stop) {
      [httpBody appendData:[[NSString stringWithFormat:@"--%@\r\n", uuidStr] dataUsingEncoding:NSUTF8StringEncoding]];
      [httpBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", parameterKey] dataUsingEncoding:NSUTF8StringEncoding]];
      [httpBody appendData:[[NSString stringWithFormat:@"%@\r\n", parameterValue] dataUsingEncoding:NSUTF8StringEncoding]];
    }];

    if ([filePath length] > 0) {
      NSURL *fileUri = [NSURL URLWithString:filePath];
      NSString *pathWithoutProtocol = [fileUri path];

      NSData *data = [[NSFileManager defaultManager] contentsAtPath:pathWithoutProtocol];
      NSString *fileName  = [filePath lastPathComponent];
      NSString *mimeType  = [self guessMIMETypeFromFileName:filePath];

      [httpBody appendData:[[NSString stringWithFormat:@"--%@\r\n", uuidStr] dataUsingEncoding:NSUTF8StringEncoding]];
      [httpBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", field, fileName] dataUsingEncoding:NSUTF8StringEncoding]];
      [httpBody appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType] dataUsingEncoding:NSUTF8StringEncoding]];
      [httpBody appendData:data];
      [httpBody appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
    }

    [httpBody appendData:[[NSString stringWithFormat:@"--%@--\r\n", uuidStr] dataUsingEncoding:NSUTF8StringEncoding]];

    return httpBody;
  }

  - (NSURLSession *) urlSession {
    @synchronized (self) {
      if (_urlSession == nil) {
        NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:BACKGROUND_SESSION_ID];
        sessionConfiguration.timeoutIntervalForResource = 60 * 60 * 24; // 1 day

        _urlSession = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate:self delegateQueue:nil];
      }
    }

    return _urlSession;
  }

#pragma NSURLSessionTaskDelegate
  - (void) URLSession:(NSURLSession *)session
  task:(NSURLSessionTask *)task
  didCompleteWithError:(NSError *)error
  {
    NSMutableDictionary *data = [NSMutableDictionary dictionaryWithObjectsAndKeys:task.taskDescription, @"id", nil];
    NSURLSessionDataTask *uploadTask = (NSURLSessionDataTask *)task;
    NSHTTPURLResponse *response = (NSHTTPURLResponse *)uploadTask.response;

    if (response != nil) {
      [data setObject:[NSNumber numberWithInteger:response.statusCode] forKey:@"responseCode"];
    }

    NSMutableDictionary *headers = [[NSMutableDictionary alloc] init];
    NSDictionary *respHeaders = response.allHeaderFields;
    for (NSString *key in respHeaders) {
      headers[[key lowercaseString]] = respHeaders[key];
    }
    [data setObject:headers forKey:@"responseHeaders"];

    NSMutableData *responseData = _responsesData[@(task.taskIdentifier)];
    if (responseData) {
      [_responsesData removeObjectForKey:@(task.taskIdentifier)];
      NSString *response = [[NSString alloc] initWithData:responseData encoding:NSUTF8StringEncoding];
      [data setObject:response forKey:@"responseBody"];
    } else {
      [data setObject:[NSNull null] forKey:@"responseBody"];
    }


    if (error == nil) {
      [self _sendEventWithName:@"RNReliableUploader-Completed" body:data];
    } else {
      [data setObject:error.localizedDescription forKey:@"error"];
      
      if (error.code == NSURLErrorCancelled) {
        [self _sendEventWithName:@"RNReliableUploader-Cancelled" body:data];
      } else {
        [self _sendEventWithName:@"RNReliableUploader-Error" body:data];
      }
    }
  }

  - (void) URLSession:(NSURLSession *)session
  task:(NSURLSessionTask *) task
  didSendBodyData:(int64_t) bytesSent
  totalBytesSent:(int64_t) totalBytesSent
  totalBytesExpectedToSend:(int64_t) totalBytesExpectedToSend {
    float progress = -1;
    if (totalBytesExpectedToSend > 0) {
    progress = 100.0 * (float)totalBytesSent / (float)totalBytesExpectedToSend;
    }
    [self _sendEventWithName:@"RNReliableUploader-ProgressUpdated" body:@{ @"id": task.taskDescription, @"progress": [NSNumber numberWithFloat:progress] }];
  }

  - (void) URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveData:(NSData *)data {
    if (!data.length) return;
    NSMutableData *responseData = _responsesData[@(dataTask.taskIdentifier)];
    if (!responseData) {
    responseData = [NSMutableData dataWithData:data];
    _responsesData[@(dataTask.taskIdentifier)] = responseData;
    } else {
    [responseData appendData:data];
    }
  }

  - (void) URLSessionDidFinishEventsForBackgroundURLSession:(NSURLSession *)session {
    if (backgroundSessionCompletionHandler) {
    double delayInSeconds = 4;
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);
    dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
    @synchronized (self) {
    if (self->backgroundSessionCompletionHandler) {
    self->backgroundSessionCompletionHandler();
    self->backgroundSessionCompletionHandler = nil;
    }
    }
    });
    }
  }

#pragma RNExportedMethods
  RCT_EXPORT_METHOD(
    upload: (NSDictionary *) options
    resolve: (RCTPromiseResolveBlock) resolve
    reject: (RCTPromiseRejectBlock) reject
  ) {
    NSString *url = options[@"url"];
    NSString *field = options[@"field"];
    NSString *method = options[@"method"];
    NSDictionary *headers = options[@"headers"];
    __block NSString *filePath = options[@"filePath"];

    NSString *currentUploadId;
    @synchronized(self) {
      currentUploadId = [NSString stringWithFormat:@"%lu", _uploadId++];
    }

    @try {
      NSURL *requestUrl = [NSURL URLWithString:url];
      NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:requestUrl];

      [request setHTTPMethod: method];

      [headers enumerateKeysAndObjectsUsingBlock:^(
        id  _Nonnull key, 
        id  _Nonnull value, 
        BOOL * _Nonnull stop
      ) {
        if ([value respondsToSelector:@selector(stringValue)]) {
          value = [value stringValue];
        }
        
        if ([value isKindOfClass:[NSString class]]) {
          [request setValue:value forHTTPHeaderField:key];
        }
      }];

      if ([filePath hasPrefix:@"assets-library"]) {
        dispatch_group_t group = dispatch_group_create();
        dispatch_group_enter(group);

        [self copyAssetToFile:filePath completionHandler:^(
          NSString * _Nullable tempFileUrl,
          NSError * _Nullable error
        ) {
          if (error) {
            dispatch_group_leave(group);
            reject(@"RN Uploader", @"Asset could not be copied to temp file.", nil);
            return;
          }

          filePath = tempFileUrl;
          dispatch_group_leave(group);
        }];

        dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
      }

      NSString *uuidStr = [[NSUUID UUID] UUIDString];
      [request setValue:[NSString stringWithFormat:@"multipart/form-data; boundary=%@", uuidStr] forHTTPHeaderField:@"Content-Type"];

      NSData *httpBody = [self createBodyWithBoundary:uuidStr filePath:filePath parameters:options field:field];
      [request setHTTPBody:httpBody];

      NSURLSessionUploadTask *uploadTask = [[self urlSession] uploadTaskWithStreamedRequest:request];
      uploadTask.taskDescription = currentUploadId;
      [uploadTask resume];

      resolve(uploadTask.taskDescription);
    } @catch (NSException *exception) {
      reject(@"RN Uploader", exception.name, nil);
    }
  }

  RCT_EXPORT_METHOD(
    cancel: (NSString *) uploadId 
    resolve: (RCTPromiseResolveBlock) resolve 
    reject: (RCTPromiseRejectBlock) reject
  ) {
    [_urlSession getTasksWithCompletionHandler:^(NSArray *dataTasks, NSArray *uploadTasks, NSArray *downloadTasks) {
      for (NSURLSessionTask *uploadTask in uploadTasks) {
        if ([uploadTask.taskDescription isEqualToString:uploadId]){
          [uploadTask cancel];
        }
      }
    }];

    resolve([NSNumber numberWithBool:YES]);
  }

  RCT_REMAP_METHOD(
    bgTaskGetRemainingTime,
    resolve: (RCTPromiseResolveBlock) resolve 
    reject: (RCTPromiseRejectBlock) reject
  ) {

    dispatch_sync(
      dispatch_get_main_queue(),
      ^(void) {
        double time = [[UIApplication sharedApplication] backgroundTimeRemaining];

        resolve([NSNumber numberWithDouble:time]);
      }
    );
  }

  RCT_EXPORT_METHOD(canSuspend) {
    double delayInSeconds = 0.2;

    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);
    dispatch_after(
      popTime,
      dispatch_get_main_queue(),
      ^(void) {
        @synchronized (self) {
          if (self->backgroundSessionCompletionHandler) {
            self->backgroundSessionCompletionHandler();
            self->backgroundSessionCompletionHandler = nil;
          }
        }
      }
    );
  }

  RCT_REMAP_METHOD(
    bgTaskStart,
    resolve: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  ) {
    __block NSUInteger taskId = UIBackgroundTaskInvalid;

    taskId = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
      if (self.isObserving && self.bridge != nil) {
        [self sendEventWithName:@"RNReliableUploader-Expired" body:@{@"id": [NSNumber numberWithUnsignedLong:taskId]}];
      }

      if (taskId != UIBackgroundTaskInvalid) { 
        double delayInSeconds = 0.7;
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);

        dispatch_after(
          popTime,
          dispatch_get_main_queue(),
          ^(void) {
            [[UIApplication sharedApplication] endBackgroundTask:taskId];
          }
        );
      }
    }];

    resolve([NSNumber numberWithUnsignedLong:taskId]);
  }

  RCT_EXPORT_METHOD(
    bgTaskEnd: (NSUInteger) taskId
    resolve: (RCTPromiseResolveBlock) resolve
    reject: (RCTPromiseRejectBlock) reject
  ) {
    @try {
      if (taskId != UIBackgroundTaskInvalid) {
        [[UIApplication sharedApplication] endBackgroundTask: taskId];
      }

      resolve([NSNumber numberWithBool:YES]);
    } @catch (NSException *exception) {
      reject(@"RN Uploader", exception.name, nil);
    }
  }

@end

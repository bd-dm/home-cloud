#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReliableUploader, NSObject)

RCT_EXTERN_METHOD(uploadItems:(NSArray *)items resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFileHash:(NSString *)fileId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReliableUploader, NSObject)

RCT_EXTERN_METHOD(uploadItems:(NSArray *)items token:(NSString)token resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

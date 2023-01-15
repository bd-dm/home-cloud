#import <Foundation/Foundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RNReliableUploader : RCTEventEmitter <RCTBridgeModule, NSURLSessionTaskDelegate>
    +(RNReliableUploader*)sharedInstance;
    -(void)setBackgroundSessionCompletionHandler:(void (^)(void))handler;
    @property (atomic) BOOL isObserving;
@end

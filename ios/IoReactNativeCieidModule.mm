#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(IoReactNativeCieidModule, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(isAppInstalled:(NSString *)appScheme)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

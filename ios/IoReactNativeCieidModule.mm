#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(IoReactNativeCieidModule, NSObject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

#import "IoReactNativeCieid.h"
#import <UIKit/UIKit.h>

@implementation IoReactNativeCieid
- (NSNumber *)isAppInstalled:(NSString *)appScheme signature:(NSString * _Nullable)signature {
    // Construct the URL with the app scheme
    NSString *urlString = [NSString stringWithFormat:@"%@://", appScheme];
    NSURL *url = [NSURL URLWithString:urlString];
    
    // Check if the URL can be opened
    if (url == nil) {
        return @(false);
    }
    
    bool isInstalled = [UIApplication.sharedApplication canOpenURL:url];
    return @(isInstalled);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeIoReactNativeCieidSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"IoReactNativeCieid";
}

@end

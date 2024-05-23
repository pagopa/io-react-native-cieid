#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(IoReactNativeCieidViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(sp_url, NSString)
RCT_EXPORT_VIEW_PROPERTY(sp_url_scheme, NSString)
RCT_EXPORT_VIEW_PROPERTY(onCieIDAuthenticationCanceled, RCTDirectEventBlock)


@end

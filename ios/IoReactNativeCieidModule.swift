@objc(IoReactNativeCieidModule)
class IoReactNativeCieidModule: NSObject {
  
  @objc
  func isAppInstalled(_ appScheme: String) -> NSNumber {
    // https://developer.apple.com/documentation/uikit/uiapplication/1622952-canopenurl#discussion
    // Beware to add any custom URL scheme that you want to query
    // to the calling app's Info.plist under the key `LSApplicationQueriesSchemes`
    guard let url = URL(string: "\(appScheme)://") else {
      return NSNumber(value: false)
    }
    let isInstalled = UIApplication.shared.canOpenURL(url)
    return NSNumber(value: isInstalled)
  }
}

@objc(IoReactNativeCieidModule)
class IoReactNativeCieidModule: NSObject {
  
  @objc
  func isAppInstalled(_ appScheme: String) -> NSNumber {
    guard let url = URL(string: "\(appScheme)://") else {
      return NSNumber(value: false)
    }
    let isInstalled = UIApplication.shared.canOpenURL(url)
    return NSNumber(value: isInstalled)
  }
}

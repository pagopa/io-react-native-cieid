import React

@objc(IoReactNativeCieidViewManager)
class IoReactNativeCieidViewManager: RCTViewManager {
  
  override func view() -> (IoReactNativeCieidView) {
    return IoReactNativeCieidView()
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

/// IoReactNativeCieidView.swift
/// A React Native view that wraps the CieIDWKWebViewController
/// and exposes the CieIDDelegate methods as React Native events.
///   - onCieIDAuthenticationCanceled - event triggered when the CieID authentication is canceled
///   - onCieIDAuthenticationError - event triggered when the CieID authentication fails
///   - onCieIDAuthenticationSuccess - event triggered when the CieID authentication is successful
///   - sp_url - the URL of the service provider
///   - sp_url_scheme - the URL scheme related to the cieid app bundle name
class IoReactNativeCieidView : UIView, CieIdDelegate {
  
  @objc var sp_url: String? {
    didSet {
      checkAndLoadWebView()
    }
  }
  @objc var sp_url_scheme: String? {
    didSet {
      checkAndLoadWebView()
    }
  }
  
  @objc var onCieIDAuthenticationCanceled: RCTDirectEventBlock?
  @objc var onCieIDAuthenticationError: RCTDirectEventBlock?
  @objc var onCieIDAuthenticationSuccess: RCTDirectEventBlock?
  
  var webView: CieIDWKWebViewController?
  
  
  func CieIDAuthenticationClosedWithSuccess() {
    if let onCieIDAuthenticationSuccess = onCieIDAuthenticationSuccess {
      let event: [String: Any] = ["message": "Cie ID authentication Success"]
      onCieIDAuthenticationSuccess(event)
    }
  }
  
  func CieIDAuthenticationClosedWithError(errorMessage: String) {
    if let onCieIDAuthenticationError = onCieIDAuthenticationError {
      let event: [String: Any] = ["message": "Cie ID authentication Error with message: \(errorMessage)"]
      onCieIDAuthenticationError(event)
    }
  }
  
  func CieIDAuthenticationCanceled() {
    if let onCieIDAuthenticationCanceled = onCieIDAuthenticationCanceled {
      let event: [String: Any] = ["message": "Cie ID authentication Canceled"]
      onCieIDAuthenticationCanceled(event)
    }
  }
  
  func checkAndLoadWebView() {
    if let _ = sp_url, let _ = sp_url_scheme {
      loadWebView()
    }
  }
  
  func loadWebView() {
    webView = CieIDWKWebViewController()
    webView?.sp_url = sp_url
    webView?.sp_url_scheme = sp_url_scheme
    webView?.view.frame = self.bounds
    webView?.delegate = self
    if let view = webView?.view {
      self.addSubview(view)
    } else {
      if let onCieIDAuthenticationError = onCieIDAuthenticationError {
        let event: [String: Any] = ["message": "Error adding webview"]
        onCieIDAuthenticationError(event)
      }
    }
  }
  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
}

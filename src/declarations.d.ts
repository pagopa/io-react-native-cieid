import 'react-native';

export interface IoReactNativeCieidModule {
  isAppInstalled: (
    packageNameOrUrlScheme: string,
    /**
     * @platform android only
     */
    signature?: string
  ) => boolean;
  /**
   * @platform android only
   */
  launchCieIdForResult: (
    packageNameOrUrlScheme: string,
    className: string,
    signature: string,
    forwardUrl: string,
    callback: (result: CieIdReturnType) => void
  ) => void;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    IoReactNativeCieidModule: IoReactNativeCieidModule;
  }
}

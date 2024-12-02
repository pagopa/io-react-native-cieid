import { Platform, NativeModules } from 'react-native';

const LINKING_ERROR =
  `The package '@pagopa/io-react-native-cieid' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const IoReactNativeCieidModule = NativeModules.IoReactNativeCieidModule
  ? NativeModules.IoReactNativeCieidModule
  : new Proxy(
      { isAppInstalled: () => false, launchCieIdForResult: () => {} },
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
const CIEID_SIGNATURE =
  '92:D1:35:40:D4:50:F6:9F:79:2C:5F:3C:77:0A:E2:85:5B:FB:23:58:B4:47:A8:DE:06:4D:51:D0:35:8E:B6:97';

export type AndroidCiedIdPackageName =
  | 'it.ipzs.cieid'
  | 'it.ipzs.cieid.collaudo';
export type IosCieIdUrlScheme = 'CIEID://';
export type CieIdPackageNameOrCustomUrl =
  | AndroidCiedIdPackageName
  | IosCieIdUrlScheme;

/**
 * Check if the CieID app is installed on the device.
 * This method is useful to check if the app is installed before trying to open it.
 *
 * **Android**:
 * This method masquerades the package name of the CieID app
 * because of the new visibility restrictions on Android 11 which prevent
 * an app from querying the package manager for the list of installed apps,
 * unless the calling app doesn't expose this interaction by providing the package name
 * in the manifest file, inside the queries element.
 *
 * __For that reason__ the package name is not meant to be passed as argument.
 *
 * ```xml
 * <!-- https://developer.android.com/training/package-visibility/declaring -->
 * <queries>
 *   <package android:name="it.ipzs.cieid" />
 *   <package android:name="it.ipzs.cieid.collaudo" />
 * </queries>
 * ```
 * This module only exposes the package name of the CieID app for the production environment
 * and the UAT environment.
 * The package name is `'it.ipzs.cieid'` for production environment
 * and `'it.ipzs.cieid.collaudo'` for UAT environment.
 *
 * **iOS:**
 * For iOS platform, the package name is not needed, but this method check if the system
 * is able to open the URL scheme of the CieID app (`CIEID://`).
 *
 * For iOS, the URL scheme is always `CIEID://` for both production and UAT environment.
 *
 * WARNING: For this to work it is necessary to add the URL scheme to the `Info.plist`
 * file of the calling app, under the `LSApplicationQueriesSchemes` key.
 *
 * ```xml
 * <key>LSApplicationQueriesSchemes</key>
 * <array>
 *  <string>CIEID</string>
 * </array>
 * ```
 *
 * @example
 * ```typescript
 * import { isCieIdAvailable } from '@pagopa/io-react-native-cieid';
 * const isInstalled = isCieIdAvailable();
 * ```
 *
 * @param isUatEnvironment - Optional. Default is `false`.
 *
 * If `true`, it checks for the UAT environment package name.
 *
 * @returns `true` if the CieID app is installed, `false` otherwise.
 */
export function isCieIdAvailable(isUatEnvironment: boolean = false): boolean {
  if (Platform.OS === 'ios') {
    return IoReactNativeCieidModule.isAppInstalled('CIEID');
  }
  return IoReactNativeCieidModule.isAppInstalled(
    isUatEnvironment ? 'it.ipzs.cieid.collaudo' : 'it.ipzs.cieid',
    CIEID_SIGNATURE
  );
}

/**
 * In case of error, the {@link openCieIdApp} method returns an object whos `id` property is set to `'ERROR'`.
 * In this case the object will have a `code` property that will be one of the following error codes.
 */
export type CieIdModuleErrorCodes =
  | 'GENERIC_ERROR'
  | 'REACT_ACTIVITY_IS_NULL'
  | 'CIEID_ACTIVITY_IS_NULL'
  | 'CIEID_SIGNATURE_MISMATCH'
  | 'CIE_NOT_REGISTERED'
  | 'AUTHENTICATION_ERROR'
  | 'NO_SECURE_DEVICE'
  | 'CIEID_EMPTY_URL_AND_ERROR_EXTRAS'
  | 'CIEID_OPERATION_CANCEL'
  | 'CIEID_OPERATION_NOT_SUCCESSFUL'
  | 'UNKNOWN_EXCEPTION';

/**
 * The result of the {@link openCieIdApp} method, coming from the callback,
 * is a union type of two possible results (see {@link CieIdReturnType}).
 * In case of error, the object will be the following.
 */
export type CieIdErrorResult = {
  id: 'ERROR';
  code: CieIdModuleErrorCodes;
  userInfo?: Record<string, string>;
};
/**
 * The result of the {@link openCieIdApp} method, coming from the callback,
 * is a union type of two possible results (see {@link CieIdReturnType}).
 * In case of success, the object will be the following.
 * The `url` property is the `URL` that the CieID app will return to the calling app,
 * after the authentication process is completed.
 */
export type CieIdSuccessResult = {
  id: 'URL';
  url: string;
};

/**
 * The result of the {@link openCieIdApp} coming from the callback.
 */
export type CieIdReturnType = CieIdErrorResult | CieIdSuccessResult;

/**
 * Open the CieID app on the device.
 * This method is useful to open the CieID app from the calling app, during the authentication process.
 * The CieID app will return to the calling app the URL that the calling app will use to complete the authentication process.
 * The `URL` will be passed to the callback function.
 * The callback function will receive an object with the `id` property set to `'URL'` in case of success.
 * The object will have a `url` property that will be the `URL` that the CieID app will return to the calling app.
 * In case of error, the object will have the `id` property set to `'ERROR'`.
 * The object will have a `code` property that will be one of the error codes of the {@link CieIdModuleErrorCodes} type.
 *
 * @param forwardUrl - The `URL` that the CieID app will use to continue the authentication process.
 * @param callback - The callback function that will receive the result of the operation.
 * @param isUatEnvironment - Optional. Default is `false`.
 * Tells the method to use the UAT environment package name instead of the production one.
 */
export function openCieIdApp(
  forwardUrl: string,
  callback: (result: CieIdReturnType) => void,
  isUatEnvironment: boolean = false
) {
  if (Platform.OS === 'ios') {
    throw new Error(
      'openCieIdApp is not available on iOS. Use Linking.openURL instead.'
    );
  }
  const cieIdPackageNameOrCustomUrl = isUatEnvironment
    ? 'it.ipzs.cieid.collaudo'
    : 'it.ipzs.cieid';
  return IoReactNativeCieidModule.launchCieIdForResult(
    cieIdPackageNameOrCustomUrl,
    'it.ipzs.cieid.BaseActivity',
    CIEID_SIGNATURE,
    forwardUrl,
    callback
  );
}

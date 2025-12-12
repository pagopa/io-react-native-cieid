import IoReactNativeCieid, {
  type CieIdReturnType,
} from './NativeIoReactNativeCieid';

import { Platform } from 'react-native';

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
    return IoReactNativeCieid.isAppInstalled('CIEID');
  }
  return IoReactNativeCieid.isAppInstalled(
    isUatEnvironment ? 'it.ipzs.cieid.collaudo' : 'it.ipzs.cieid',
    isUatEnvironment ? null : CIEID_SIGNATURE
  );
}

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
  return IoReactNativeCieid.launchCieIdForResult(
    cieIdPackageNameOrCustomUrl,
    'it.ipzs.cieid.BaseActivity',
    forwardUrl,
    callback,
    isUatEnvironment ? null : CIEID_SIGNATURE
  );
}

export type { CieIdReturnType } from './NativeIoReactNativeCieid';

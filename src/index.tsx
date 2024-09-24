import {
  requireNativeComponent,
  UIManager,
  Platform,
  NativeModules,
  type ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package '@pagopa/io-react-native-cieid' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type IoReactNativeCieidProps = {
  style: ViewStyle;
  sp_url: string;
  sp_url_scheme: string;
  onCieIDAuthenticationCanceled?: () => void;
  onCieIDAuthenticationSuccess?: () => void;
  onCieIDAuthenticationError?: () => void;
};

const ComponentName = 'IoReactNativeCieidView';

export const IoReactNativeCieidView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<IoReactNativeCieidProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

const IoReactNativeCieidModule = NativeModules.IoReactNativeCieidModule
  ? NativeModules.IoReactNativeCieidModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

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
 * WARNING: For this to work it is necessary to add the URL scheme to the `Info.plist` file of the calling app.
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
  const cieIdPackageNameOrCustomUrl = Platform.select({
    ios: 'CIEID',
    default: isUatEnvironment ? 'it.ipzs.cieid.collaudo' : 'it.ipzs.cieid',
  });
  return IoReactNativeCieidModule.isAppInstalled(cieIdPackageNameOrCustomUrl);
}

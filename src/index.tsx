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

export function multiply(a: number, b: number): Promise<number> {
  return IoReactNativeCieidModule.multiply(a, b);
}

/**
 * Check if the CIEID app is installed on the device.
 * This method is useful to check if the app is installed before trying to open it.
 * The package name is 'it.ipzs.cieid' for production environment
 * and 'it.ipzs.cieid.collaudo' for UAT environment.
 * @example
 * ```typescript
 * import { isCieIdAvailable } from '@pagopa/io-react-native-cieid';
 * const isInstalled = isCieIdAvailable();
 * ```
 * WARNING: This is available only on Android, calling it on iOS will throw an error.
 *
 * @param packageName The package name of the CIEID app to check.
 * It defaults to 'it.ipzs.cieid'.
 * In case of UAT environment, the package name is 'it.ipzs.cieid.collaudo'.
 * If you need to check for a different package name, pass it as argument.
 * @returns true if the app is installed, false otherwise.
 */
export function isCieIdAvailable(
  packageName: string = 'it.ipzs.cieid'
): boolean {
  if (Platform.OS === 'ios') {
    throw new Error('isCieIdAvailable is not available on iOS');
  }
  return IoReactNativeCieidModule.isAppInstalled(packageName);
}

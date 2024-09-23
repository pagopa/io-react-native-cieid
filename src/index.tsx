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

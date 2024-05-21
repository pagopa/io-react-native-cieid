import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'io-react-native-cieid' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type IoReactNativeCieidProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'IoReactNativeCieidView';

export const IoReactNativeCieidView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<IoReactNativeCieidProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

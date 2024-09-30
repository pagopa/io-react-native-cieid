import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WebViewLoginNavigationProps } from '../screen/WebViewLoginScreen';

export type NavigatorStackParamList = {
  Home: undefined;
  NativeModule: undefined;
  NativeView: undefined;
  WebViewLoginConfig: undefined;
  WebViewLogin: WebViewLoginNavigationProps;
};

export const Stack = createNativeStackNavigator<NavigatorStackParamList>();

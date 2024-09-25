import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type NavigatorStackParamList = {
  Home: undefined;
  NativeModule: undefined;
  NativeView: undefined;
  WebViewLogin: undefined;
};

export const Stack = createNativeStackNavigator<NavigatorStackParamList>();

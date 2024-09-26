import * as React from 'react';

import { openCieIdApp } from '@pagopa/io-react-native-cieid';
import { Alert, Linking, Platform, SafeAreaView } from 'react-native';
import WebView, { type WebViewNavigation } from 'react-native-webview';
import type { WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { styles } from '../common/style';
import type { NavigatorStackParamList } from '../navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SpidLevel = 'SpidL2' | 'SpidL3';

export type WebViewLoginNavigationProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};

const iOSUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined,
});

const originSchemasWhiteList = ['https://*', 'iologin://*'];

// Set servie provider URL as pattern string for entityID=xx_servizicie and authLevel=SpidL2
const serviceProviderUrl =
  'https://app-backend.io.italia.it/login?entityID={ID}&authLevel={SPID_LEVEL}';

export const WebViewLogin = () => {
  React.useEffect(() => {
    // https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
    Linking.addEventListener('url', ({ url }) => {
      console.log('-- -->URL from Deep Liking', url);
      // if the url is of this format: iologincie:https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
      // extract the part after iologincie: and dispatch the action to handle the login
      if (url.startsWith('iologincie:')) {
        const continueUrl = url.split('iologincie:')[1];
        if (continueUrl) {
          console.log('-- --> iOS continue URL', continueUrl);
          setAuthenticatedUrl(continueUrl);
        }
      }
    });

    return () => Linking.removeAllListeners('url');
  }, []);

  const webView = React.useRef<WebView>(null);
  const [authenticatedUrl, setAuthenticatedUrl] = React.useState<string | null>(
    null
  );

  const navigation =
    useNavigation<
      NativeStackNavigationProp<NavigatorStackParamList, 'WebViewLogin'>
    >();

  const route = useRoute<RouteProp<NavigatorStackParamList, 'WebViewLogin'>>();
  const { spidLevel, isUat } = route.params;
  console.log('<-- ^^ --> spidLevel: ', spidLevel, 'isUat: ', isUat);
  const filledServiceProviderUrl = serviceProviderUrl
    .replace('{SPID_LEVEL}', spidLevel)
    .replace('{ID}', isUat ? 'xx_servizicie_coll' : 'xx_servizicie');

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    const url = event.url;
    console.log('--> url', url);

    if (url.indexOf('token=') !== -1) {
      console.log('-^^- --> Login token found', url);
      const token = url.split('token=')[1];
      if (token) {
        console.log('-^^- --> Login token extracted', token);
        // show success alert with dismiss button navigatin back
        Alert.alert('Login success ✅🥳', token, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
      return false;
    }

    if (
      url.indexOf('livello1') >= 0 || // SpidL1
      (url.indexOf('livello2') >= 0 && url.indexOf('livello2mobile') === -1) || // SpidL2
      url.indexOf('nextUrl') >= 0 || // SpidL3 iOS
      url.indexOf('openApp') >= 0 // SpidL3 Android
    ) {
      console.log('SPID L2 URL found: ', url, url.indexOf('livello2'));
      if (Platform.OS === 'ios') {
        const urlForCieId = `CIEID://${url}&sourceApp=iologincie`;
        console.log('---- --> iOS forward URL: ', url, urlForCieId);
        Linking.openURL(urlForCieId).catch((err) => {
          console.error(
            '---- --> (App CieID not installed?) An error occurred',
            err
          );
          navigation.goBack();
        });
      } else {
        openCieIdApp(
          url,
          (result) => {
            if (result.id === 'ERROR') {
              console.error('^--^ -->', JSON.stringify(result, null, 2));
              navigation.goBack();
            } else {
              console.log('^--^ -->', result.id, result.url);
              setAuthenticatedUrl(result.url);
            }
          },
          isUat
        );
      }
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webView}
        startInLoadingState={true}
        userAgent={defaultUserAgent}
        javaScriptEnabled={true}
        originWhitelist={originSchemasWhiteList}
        onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
        source={
          { uri: authenticatedUrl ?? filledServiceProviderUrl } as WebViewSource
        }
      />
    </SafeAreaView>
  );
};

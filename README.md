# @pagopa/io-react-native-cieid 🪪

A React Native bridge to integrate CieID authentication into your app. It provides both a native UI component and native module methods to interact with the CieID app. It's based on [cieid-ios-sdk](https://github.com/IPZSMobileTeam/cieid-ios-sdk) and [cieid-android-sdk](https://github.com/IPZSMobileTeam/cieid-android-sdk).

:construction: **NOTE:** The Native View component (`IoReactNativeCieidView`) is currently only available on iOS. Android platform support is not yet implemented for the Native View. However, the Native Module methods (e.g., `isCieIdAvailable`) are available on both iOS and Android.

## Installation

```sh
// with npm
npm install @pagopa/io-react-native-cieid

// or if you use yarn
yarn add @pagopa/io-react-native-cieid
```

## Usage

### Native Module Methods

:arrow_forward: `isCieIdAvailable` - Check if the CieID app is installed on the device.

#### Android:

Due to Android 11's package visibility restrictions, apps need to declare the packages they intend to query in their `AndroidManifest.xml` within the `<queries>` element. However, this library already includes the necessary package visibility declarations in its own manifest. Thanks to the manifest merging feature of Android, your app automatically inherits these declarations, and you don't need to add them manually.

#### iOS:

To check if the CieID app can be opened via its `URL` scheme, you need to declare the URL scheme in your `Info.plist` file.

Add the following to your `Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>CIEID</string>
</array>
```

#### Example:

```typescript
import { isCieIdAvailable } from '@pagopa/io-react-native-cieid';

// Check if the CieID app is installed (default is production environment)
const isInstalled = isCieIdAvailable();

// Optionally, check for UAT environment
const isUatInstalled = isCieIdAvailable(true);
```

**Parameters**:

- `isUatEnvironment` _(boolean)_: Optional. Default is `false`. If `true`, it checks for the UAT environment package name.

**Returns**:

- `boolean`: Returns `true` if the CieID app is installed, `false` otherwise.

<hr/>

:arrow_forward: `openCieIdApp` - Allow you to open the CieID app when needed during the authentication process. It supports callback functions to handle the result of the operation.

#### Example:

```ts
import { openCieIdApp } from '@pagopa/io-react-native-cieid';

// Open the CieID app
openCieIdApp('https://your-app.com/auth-callback', (result) => {
  if (result.id === 'URL') {
    console.log('Authentication on CieID succeeded with URL:', result.url);
  } else if (result.id === 'ERROR') {
    console.error(
      'Authentication on CieID failed with error code:',
      result.code
    );
  }
});
```

**Parameters**:

- `forwardUrl` _(string)_: The `URL` that the CieID app will use to continue the authentication process.
- `callback` _(function)_: A callback function that receives the result of the operation either success or failure.
- `isUatEnvironment` _(boolean)_: Optional. Default is `false`. Tells the method to use the UAT environment package name `'it.ipzs.cieid.collaudo'` instead of the production one `'it.ipzs.cieid'`, and to change the service provider IdP id from `'xx_servizicie'` to `'xx_servizicie_coll'`

**Returns**:

- On **success**, the callback will receive an object with the `id` property set to `'URL'` and a `url` property containing the returned `URL`.
- On **failure**, the callback will receive an object with the `id` property set to `'ERROR'` and a `code` property containing one of the error codes from the `CieIdModuleErrorCodes` type.

#### Android:

This method uses the Android package name to open the CieID app and requires the app's package visibility in the manifest. The method will automatically use `'it.ipzs.cieid'` for the production environment and `'it.ipzs.cieid.collaudo'` for UAT.

#### iOS:

:warning: This method is not available on iOS. Use `Linking.openURL` to open the CieID app on iOS.

In case you need to open the CieID app on iOS, you can use the following code:

```ts
import { Linking } from 'react-native';

Linking.openURL(urlForCieId).catch((err) => {
  console.error('---- --> (App CieID not installed?) An error occurred', err);
});
```

Be aware to subscribe to the `url` event in your app to handle the CieID app callback coming from the deep linking.

```ts
import { Linking } from 'react-native';

Linking.addEventListener('url', (event) => {
  console.log(event.url);
});
```

And to add the appropriate code for deep linking in you `AppDelegate.m` file:

```objc
// https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

Inside the sample app, you can find a complete example of how to handle the CieID login process on both iOS and Android.

#### Example:

```ts
[...]

  React.useEffect(() => {
    // https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
    Linking.addEventListener('url', ({ url }) => {
      console.log('-- --> URL from Deep Liking', url);
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

[...]

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
      console.log('SPID URL found: ', url);
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

[...]
```

:rotating_light: If you use the sample app to test the CieID login process, remember that you actual session on App IO will be invalidated. :rotating_light:

<hr/>

### IoReactNativeCieidView Component (iOS Only)

:construction: **Note**: The `IoReactNativeCieidView` component is not production ready and it is currently only available on iOS. Android support is not yet implemented.

- `sp_url` - The `URL` of the federated service provider.
- `sp_url_scheme` - The app bundle name to open (e.g., `it.ipzs.cieid`).

```tsx
import { IoReactNativeCieidView } from '@pagopa/io-react-native-cieid';

// ...

<IoReactNativeCieidView
  sp_url={'https://ios.idserver.servizicie.interno.gov.it/'}
  sp_url_scheme={'it.ipzs.cieid'}
  style={styles.container}
  onCieIDAuthenticationCanceled={() =>
    console.log('onCieIDAuthenticationCanceled')
  }
  onCieIDAuthenticationSuccess={() =>
    console.log('onCieIDAuthenticationSuccess')
  }
  onCieIDAuthenticationError={() => console.log('onCieIDAuthenticationError')}
/>;

// ...
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

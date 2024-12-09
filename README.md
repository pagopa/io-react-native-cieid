# @pagopa/io-react-native-cieid 🪪

A React Native bridge to integrate CieID authentication into your app. It provides a native module methods to interact with the CieID app. It's based on [cieid-ios-sdk](https://github.com/IPZSMobileTeam/cieid-ios-sdk) and [cieid-android-sdk](https://github.com/IPZSMobileTeam/cieid-android-sdk).

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

Add the following value to [LSApplicationQueriesSchemes](https://developer.apple.com/documentation/uikit/uiapplication/1622952-canopenurl#discussion) key inside your `Info.plist`:

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

- `isUatEnvironment` _(boolean)_: Optional. Default is `false`. If `true`, it checks for the UAT environment package name and, in case of `android` devices, whether to pass the app production signature or not as second parameter.

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
- `isUatEnvironment` _(boolean)_: Optional. Default is `false`. Tells the method to use the UAT environment package name `'it.ipzs.cieid.collaudo'` instead of the production one `'it.ipzs.cieid'`, to change the service provider IdP id from `'xx_servizicie'` to `'xx_servizicie_coll'`, and to omit the `CieID` app signature since it's related to the `'it.ipzs.cieid'` package name.

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

And to add the appropriate code for deep linking in your `AppDelegate.m` file:

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
    const urlListenerSubscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        console.log('-- -->URL from Deep Liking', url);
        // if the url is of this format: iologincie:https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
        // extract the part after iologincie: and dispatch the action to handle the login
        if (url.startsWith('iologincie:')) {
          const continueUrl = url.split('iologincie:')[1];

          if (continueUrl) {
            console.log('-- --> iOS continue URL', continueUrl);
            // https://idserver.servizicie.interno.gov.it/cieiderror?cieid_error_message=Operazione_annullata_dall'utente
            // We check if the continueUrl is an error
            if (continueUrl.indexOf('cieiderror') !== -1) {
              // And we extract the error message and show it in an alert
              const errorMessage = continueUrl.split('cieid_error_message=')[1];
              Alert.alert('Login error ❌', errorMessage ?? 'error');
            } else {
              setAuthenticatedUrl(continueUrl);
            }
          }
        }
      }
    );

    return () => urlListenerSubscription.remove();
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

:rotating_light: If you use the sample app to test the CieID login process, remember that your actual session on App IO will be invalidated. :rotating_light:

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

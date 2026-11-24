# @pagopa/io-react-native-cieid 🪪

A React Native bridge to integrate CieID authentication into your app. It provides a native module methods to interact with the CieID app.

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

// Optionally, check for a non-production environment
const isPreprodInstalled = isCieIdAvailable('preprod');
const isCollInstalled = isCieIdAvailable('coll');
```

**Parameters**:

- `environment` _(`CieIdEnvironment`)_: Optional. Default is `'production'`. Selects which package name is checked on `android` devices, and whether the app production signature is passed as second parameter (it is only passed for `'production'`):

| `environment`  | Android package name     | Signature check |
| -------------- | ------------------------ | --------------- |
| `'production'` | `it.ipzs.cieid`          | yes             |
| `'preprod'`    | `it.ipzs.cieid.collaudo` | no              |
| `'coll'`       | `it.ipzs.cieid.coll`     | no              |

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
      result.code,
      'detail:',
      result.message
    );
  }
});
```

**Parameters**:

- `forwardUrl` _(string)_: The `URL` that the CieID app will use to continue the authentication process.
- `callback` _(function)_: A callback function that receives the result of the operation either success or failure.
- `environment` _(`CieIdEnvironment`)_: Optional. Default is `'production'`. Tells the method which package name to use — `'it.ipzs.cieid'` for `'production'`, `'it.ipzs.cieid.collaudo'` for `'preprod'`, `'it.ipzs.cieid.coll'` for `'coll'`. For every non-production environment the `CieID` app signature is omitted, since it's related to the `'it.ipzs.cieid'` package name only; the calling app is also expected to use the `'xx_servizicie_coll'` service provider IdP id instead of `'xx_servizicie'`.

**Returns**:

- On **success**, the callback will receive an object with the `id` property set to `'URL'` and a `url` property containing the returned `URL`.
- On **failure**, the callback will receive an object with the `id` property set to `'ERROR'` and a `code` property containing one of the error codes from the `CieIdModuleErrorCodes` type.

#### Android:

This method uses the Android package name to open the CieID app and requires the app's package visibility in the manifest. The method will automatically pick the package name matching the `environment` parameter: `'it.ipzs.cieid'` for `'production'`, `'it.ipzs.cieid.collaudo'` for `'preprod'` and `'it.ipzs.cieid.coll'` for `'coll'`.

When CieID returns an Android `error_message` extra, it is included as `result.message` for both `RESULT_OK` and `RESULT_CANCELED` responses. `USER_CANCELLED*` values identify voluntary cancellations; `IDP_*` values are service errors and `CERTIFICATE_*` / `CARD_*` values concern the card or certificate.

Possible `message` values:

| Value | Level | When it occurs | Recommended handling |
| --- | --- | --- | --- |
| `IDP_HTTP_ERROR` | L3 | The Identity Provider returned an HTTP error status. | Treat as a temporary service error and suggest trying again later. |
| `IDP_EMPTY_RESPONSE` | L3 | The Identity Provider returned an empty response. | Suggest retrying; if it persists, report it to IPZS with the date and time. |
| `IDP_INVALID_CODE` | L3 | The Identity Provider response does not contain an authentication code in the expected format. | This is not user-dependent; report it to IPZS with the date, time, and requested level. |
| `IDP_RESPONSE_PARSING_ERROR` | L3 | The Identity Provider response could not be parsed. | Handle as `IDP_INVALID_CODE`. |
| `CERTIFICATE_REVOKED` | L3 | The CIE authentication certificate has been revoked. | Do not suggest retrying; tell the user the card is no longer valid for authentication and to contact their municipality. |
| `CERTIFICATE_EXPIRED` | L3 | The CIE authentication certificate has expired. | Do not suggest retrying; inform the user that the card has expired. |
| `USER_CANCELLED_AFTER_WRONG_PIN` | L3 | The user entered an incorrect PIN and chose to cancel instead of retrying. | Treat as a cancellation, not an error; the user may be reminded to check their PIN. |
| `CIE_NOT_REGISTERED` | L3 | L3 authentication was requested, but no CIE is registered in the CieID app. | Ask the user to register their card in CieID, then retry. |
| `USER_CANCELLED` | L1, L2, L3 | The user went back or cancelled without seeing an error. | Treat as voluntary cancellation and return to the access-method selection. |
| `USER_CANCELLED_DURING_NFC` | L3 | The user went back during card reading. | Treat as voluntary cancellation. |
| `NFC_TIMEOUT` | L3 | The card was not presented in time and the user cancelled. | Suggest retrying with the card held against the phone. |
| `NFC_READ_ERROR` | L3 | Card reading was interrupted or unsuccessful, and the user exited. | Suggest retrying without moving the card during reading. |
| `NOT_A_CIE` | L3 | A non-CIE card was presented, and the user exited. | Remind the user to use their Electronic Identity Card (CIE). |
| `NO_INTERNET_CONNECTION` | L1, L2, L3 | The connection to the Identity Provider was unavailable or timed out, and the user exited. | Ask the user to check their connection and retry. |
| `CARD_PIN_LOCKED` | L3 | The CIE PIN is locked. | Tell the user they can unblock the PIN with their PUK in the CieID app. |
| `CARD_PUK_LOCKED` | L3 | The CIE PUK is also locked. | Tell the user to contact their municipality. |
| `AUTHENTICATION_FAILED` | L1, L2 | Authentication with CieID credentials failed. | Suggest retrying or using another access method. |
| `DEVICE_NOT_SECURE` | L1, L2, L3 | CieID detected a modified (rooted) device and cannot proceed. | Do not suggest retrying on the same device. |
| `INVALID_REQUEST` | L1, L2, L3 | The URL is invalid or not accepted by CieID. For L3, only the `OpenApp` URL is accepted. | Treat as an integration error and check the URL passed in the Intent. |

For `CIEID_OPERATION_CANCEL` results without `message`, handle the result as a generic cancellation; CieID may have been terminated by the system or may be an older version. For other error results, continue to handle `result.code` even when `message` is absent. Successful responses do not include this field.

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
          environment
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

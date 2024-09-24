# @pagopa/io-react-native-cieid 🪪

A React Native bridge to integrate CieID authentication into your app. It provides both a native UI component and native module methods to interact with the CieID app. It's based on [cieid-ios-sdk](https://github.com/IPZSMobileTeam/cieid-ios-sdk) and [cieid-android-sdk](https://github.com/IPZSMobileTeam/cieid-android-sdk).

**NOTE:** The Native View component (`IoReactNativeCieidView`) is currently only available on iOS. Android platform support is not yet implemented for the Native View. However, the Native Module methods (e.g., `isCieIdAvailable`) are available on both iOS and Android.

## Installation

```sh
// with npm
npm install @pagopa/io-react-native-cieid

// or if you use yarn
yarn add @pagopa/io-react-native-cieid
```

## Usage

### Native Module Methods

`isCieIdAvailable` - Check if the CieID app is installed on the device.

#### Android:

Due to Android 11's package visibility restrictions, apps need to declare the packages they intend to query in their `AndroidManifest.xml` within the `<queries>` element. However, this library already includes the necessary package visibility declarations in its own manifest. Thanks to the manifest merging feature of Android, your app automatically inherits these declarations, and you don't need to add them manually.

#### iOS:

To check if the CieID app can be opened via its URL scheme, you need to declare the URL scheme in your `Info.plist` file.

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

- `isUatEnvironment` _(boolean)_: Optional. Default is `false`. If true, it checks for the UAT environment package name.

**Returns**:

- `boolean`: Returns true if the CieID app is installed, false otherwise.

### IoReactNativeCieidView Component (iOS Only)

**Note**: The `IoReactNativeCieidView` component is not production ready and it is currently only available on iOS. Android support is not yet implemented.

- `sp_url` - The URL of the federated service provider.
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

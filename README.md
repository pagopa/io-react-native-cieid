# io-react-native-cieid

A React Native bridge to add CieID authentication on IO, it's based on [cieid-ios-sdk](https://github.com/IPZSMobileTeam/cieid-ios-sdk) and [cieid-android-sdk](https://github.com/IPZSMobileTeam/cieid-android-sdk)

**NOTE: It is not production ready and can only be used with iOS (Android platform not yet implemented)**

## Installation

```sh
// with npm
npm install @pagopa/io-react-native-cieid

// or if you use yarn
yarn add @pagopa/io-react-native-cieid
```

## Usage

- sp_url is - the URL of the federated service provider
- sp_url_scheme - is the app bundle name to open (ex. it.ipzs.cieid)

```js
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

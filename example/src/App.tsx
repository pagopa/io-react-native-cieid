import * as React from 'react';

import { Platform, StyleSheet } from 'react-native';
import {
  IoReactNativeCieidView,
  multiply,
} from '@pagopa/io-react-native-cieid';

export default function App() {
  React.useEffect(() => {
    const platformName = Platform.OS;
    const message = `${platformName} - Test multiply 3 * 7 =`;
    multiply(3, 7)
      .then((r) => {
        console.log(message, r);
      })
      .catch((e) => {
        console.error(message, e);
      });
  }, []);

  return (
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
      onCieIDAuthenticationError={() =>
        console.log('onCieIDAuthenticationError')
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: 'blue',
    marginVertical: 20,
  },
});

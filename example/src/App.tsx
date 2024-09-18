import * as React from 'react';

import { StyleSheet } from 'react-native';
import { IoReactNativeCieidView } from '@pagopa/io-react-native-cieid';

export default function App() {
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

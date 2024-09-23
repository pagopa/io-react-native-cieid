import * as React from 'react';

import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  IoReactNativeCieidView,
  isCieIdAvailable,
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

  const iOSComponent = (
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

  const androidComponent = (
    <SafeAreaView style={styles.androidContainer}>
      <View>
        <Text style={styles.title}>
          Test if the CIEID app is installed on the device.
        </Text>
        <Button
          title="Press me"
          onPress={() => {
            Alert.alert(
              'CIEID app is installed',
              isCieIdAvailable('it.ipzs.cieid') ? 'Yes ✅' : 'No ❌'
            );
          }}
        />
      </View>
      <View style={styles.separator} />
      <View>
        <Text style={styles.title}>
          Test if the CIEID app pointing to UAT environment is installed on the
          device.
        </Text>
        <Button
          title="Press me"
          color="#f194ff"
          onPress={() =>
            Alert.alert(
              'CIEID UAT 🧪 app is installed',
              isCieIdAvailable('it.ipzs.cieid.collaudo') ? 'Yes ✅' : 'No ❌'
            )
          }
        />
      </View>
    </SafeAreaView>
  );

  return Platform.select({
    ios: iOSComponent,
    default: androidComponent,
  });
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
  androidContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

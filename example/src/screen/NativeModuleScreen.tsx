import * as React from 'react';

import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { isCieIdAvailable, openCieIdApp } from '@pagopa/io-react-native-cieid';

export const NativeModule = () => (
  <SafeAreaView style={styles.container}>
    <View>
      <Text style={styles.title}>
        Test if the CieID app is installed on the device.
      </Text>
      <Button
        title="Press me"
        onPress={() => {
          Alert.alert(
            'CIEID app is installed',
            isCieIdAvailable() ? 'Yes ✅' : 'No ❌'
          );
        }}
      />
    </View>
    <View style={styles.separator} />
    <View>
      <Text style={styles.title}>
        Test if the CieID app pointing to UAT environment is installed on the
        device.
      </Text>
      <Button
        title="Press me"
        color="#f194ff"
        onPress={() =>
          Alert.alert(
            'CIEID UAT 🧪 app is installed',
            isCieIdAvailable(true) ? 'Yes ✅' : 'No ❌'
          )
        }
      />
    </View>
    <View style={styles.separator} />
    <View>
      <Text style={styles.title}>Test CieID Opening (production)</Text>
      <Button
        title="Press me"
        color="#00ee66"
        onPress={() =>
          openCieIdApp(
            'https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=...&SPLogo=...&value=e1s2',
            (result) => {
              if (result.id === 'ERROR') {
                console.error(JSON.stringify(result, null, 2));
              } else {
                console.log(result.id, result.url);
              }
            }
          )
        }
      />
    </View>
    <View style={styles.separator} />
    <View>
      <Text style={styles.title}>Test CieID Opening (UAT)</Text>
      <Button
        title="Press me"
        color="#ee6600"
        onPress={() =>
          openCieIdApp(
            'https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=...&SPLogo=...&value=e1s2',
            (result) => {
              if (result.id === 'ERROR') {
                console.error(JSON.stringify(result, null, 2));
              } else {
                console.log(result.id, result.url);
              }
            },
            true
          )
        }
      />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

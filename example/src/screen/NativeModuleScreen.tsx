import * as React from 'react';

import { Alert, Button, SafeAreaView, Text, View } from 'react-native';
import { isCieIdAvailable, openCieIdApp } from '@pagopa/io-react-native-cieid';
import { styles } from '../common/style';

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
        Test if the CieID app pointing to preprod environment is installed on
        the device.
      </Text>
      <Button
        title="Press me"
        color="#f194ff"
        onPress={() =>
          Alert.alert(
            'CIEID preprod 🧪 app is installed',
            isCieIdAvailable('preprod') ? 'Yes ✅' : 'No ❌'
          )
        }
      />
    </View>
    <View style={styles.separator} />
    <View>
      <Text style={styles.title}>
        Test if the CieID app pointing to coll environment is installed on the
        device.
      </Text>
      <Button
        title="Press me"
        color="#9494ff"
        onPress={() =>
          Alert.alert(
            'CIEID coll 🧪 app is installed',
            isCieIdAvailable('coll') ? 'Yes ✅' : 'No ❌'
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
      <Text style={styles.title}>Test CieID Opening (preprod)</Text>
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
            'preprod'
          )
        }
      />
    </View>
    <View style={styles.separator} />
    <View>
      <Text style={styles.title}>Test CieID Opening (coll)</Text>
      <Button
        title="Press me"
        color="#ee0066"
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
            'coll'
          )
        }
      />
    </View>
  </SafeAreaView>
);

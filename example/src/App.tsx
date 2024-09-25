import * as React from 'react';

import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  IoReactNativeCieidView,
  isCieIdAvailable,
  openCieIdApp,
} from '@pagopa/io-react-native-cieid';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';

type NavigatorStackParamList = {
  Home: undefined;
  NativeModule: undefined;
  NativeView: undefined;
};
const Stack = createNativeStackNavigator<NavigatorStackParamList>();

type HomeScreenNavigationProp = NativeStackNavigationProp<
  NavigatorStackParamList,
  'Home'
>;
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.androidContainer}>
      <View>
        <Text style={styles.title}>Test single exposed module functions</Text>
        <Button
          title="Atomic utility functions"
          color="#cc00ff"
          onPress={() => {
            navigation.navigate('NativeModule');
          }}
        />
      </View>
      <View style={styles.separator} />
      <View>
        <Text style={styles.title}>Test SDK native view integration</Text>
        <Button
          title="Native SDK"
          color="#ff6600"
          onPress={() => navigation.navigate('NativeView')}
        />
      </View>
    </SafeAreaView>
  );
};

const NativeModule = () => (
  <SafeAreaView style={styles.androidContainer}>
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
            (id, result, userInfo) => {
              if (id === 'ERROR') {
                console.error(id, result, JSON.stringify(userInfo, null, 2));
              } else {
                console.log(id, result);
              }
            }
          )
        }
      />
    </View>
  </SafeAreaView>
);

const NativeView = () => (
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
  />
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'CieID React Native Library' }}
        />
        <Stack.Screen name="NativeModule" component={NativeModule} />
        <Stack.Screen name="NativeView" component={NativeView} />
      </Stack.Navigator>
    </NavigationContainer>
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

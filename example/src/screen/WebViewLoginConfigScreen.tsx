import * as React from 'react';

import { Button, SafeAreaView, Switch, Text, View } from 'react-native';
import type { NavigatorStackParamList } from '../navigation';
import { styles } from '../common/style';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  NavigatorStackParamList,
  'Home'
>;
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export const WebViewLoginConfig: React.FC<HomeScreenProps> = () => {
  const [isSpidLevel3Enabled, setIsSpidLevel3Enabled] = React.useState(false);
  const toggleSpidLevel3Switch = () =>
    setIsSpidLevel3Enabled((previousState) => !previousState);
  const [isUatEnabled, setIsUatEnabled] = React.useState(false);
  const toggleUatSwitch = () =>
    setIsUatEnabled((previousState) => !previousState);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<NavigatorStackParamList, 'WebViewLoginConfig'>
    >();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.disclaimer}>
          🚨 Be aware that if you do a success login, your current App IO
          session will be invalidated. 🚨
        </Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.switchContainer}>
        <Text style={styles.title}>SPID Level 3 (default is 2)</Text>
        <Switch
          value={isSpidLevel3Enabled}
          onValueChange={toggleSpidLevel3Switch}
        />
      </View>
      <View style={styles.separator} />
      <View style={styles.switchContainer}>
        <Text style={styles.title}>
          Set UAT environment (default is production)
        </Text>
        <Switch value={isUatEnabled} onValueChange={toggleUatSwitch} />
      </View>
      <View style={styles.separator} />
      <View>
        <Text
          style={styles.title}
        >{`Test CieId ${isUatEnabled ? 'UAT' : 'production'} login with ${isSpidLevel3Enabled ? 'L3' : 'L2'}`}</Text>
        <Button
          title="Test CieId Login"
          // nice fluo color
          color="#00ee66"
          onPress={() =>
            navigation.navigate({
              name: 'WebViewLogin',
              params: {
                spidLevel: isSpidLevel3Enabled ? 'SpidL3' : 'SpidL2',
                isUat: isUatEnabled,
              },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
};

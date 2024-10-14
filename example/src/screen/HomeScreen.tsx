import * as React from 'react';

import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, SafeAreaView, Text, View } from 'react-native';
import type { NavigatorStackParamList } from '../navigation';
import { styles } from '../common/style';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  NavigatorStackParamList,
  'Home'
>;
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Test CieID login</Text>
        <Button
          title="Test CieID Login"
          // nice fluo color
          color="#ff6600"
          onPress={() => navigation.navigate('WebViewLoginConfig')}
        />
      </View>
    </SafeAreaView>
  );
};

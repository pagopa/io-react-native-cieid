import { NavigationContainer } from '@react-navigation/native';
import { Stack } from './navigation';
import { HomeScreen } from './screen/HomeScreen';
import { NativeModule } from './screen/NativeModuleScreen';
import { WebViewLogin } from './screen/WebViewLoginScreen';
import { WebViewLoginConfig } from './screen/WebViewLoginConfigScreen';

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
        <Stack.Screen name="WebViewLogin" component={WebViewLogin} />
        <Stack.Screen
          name="WebViewLoginConfig"
          component={WebViewLoginConfig}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

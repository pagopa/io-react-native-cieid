import type { CieIdErrorResult } from '@pagopa/io-react-native-cieid';
import { Alert } from 'react-native';

export const showCieIdError = (
  error: CieIdErrorResult,
  onDismiss?: () => void
) => {
  Alert.alert('CieID error ❌', JSON.stringify(error, null, 2), [
    { text: 'OK', onPress: onDismiss },
  ]);
};

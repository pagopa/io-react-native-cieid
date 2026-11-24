import type { CieIdErrorResult } from '@pagopa/io-react-native-cieid';
import { Alert } from 'react-native';

const formatErrorValue = (value: string) =>
  value
    .split('_')
    .map((word) => {
      switch (word.toUpperCase()) {
        case 'CIEID':
          return 'CieID';
        case 'CIE':
        case 'HTTP':
        case 'IDP':
        case 'NFC':
        case 'PIN':
        case 'PUK':
          return word.toUpperCase();
        default:
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join(' ');

export const showCieIdError = (
  error: CieIdErrorResult,
  onDismiss?: () => void
) => {
  const details = error.error_message
    ? `Reason: ${formatErrorValue(error.error_message)}\nError code: ${formatErrorValue(error.code)}`
    : `Error code: ${formatErrorValue(error.code)}`;

  Alert.alert('CieID error ❌', details, [{ text: 'OK', onPress: onDismiss }]);
};

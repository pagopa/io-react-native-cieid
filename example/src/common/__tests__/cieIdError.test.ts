import { Alert } from 'react-native';
import { showCieIdError } from '../cieIdError';

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));

describe('showCieIdError', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  afterEach(() => {
    alert.mockClear();
  });

  afterAll(() => {
    alert.mockRestore();
  });

  it('displays the complete returned object as formatted JSON', () => {
    const onDismiss = jest.fn();
    const error = {
      id: 'ERROR' as const,
      code: 'CIEID_OPERATION_CANCEL' as const,
      userInfo: { detail: 'Example' },
      message: 'NFC_READ_ERROR' as const,
    };
    showCieIdError(error, onDismiss);

    expect(alert).toHaveBeenCalledWith(
      'CieID error ❌',
      JSON.stringify(error, null, 2),
      [{ text: 'OK', onPress: onDismiss }]
    );
  });

  it('displays an error without the optional message', () => {
    const error = {
      id: 'ERROR' as const,
      code: 'CIEID_OPERATION_CANCEL' as const,
      userInfo: null,
    };
    showCieIdError(error);

    expect(alert).toHaveBeenCalledWith(
      'CieID error ❌',
      JSON.stringify(error, null, 2),
      [{ text: 'OK', onPress: undefined }]
    );
  });
});

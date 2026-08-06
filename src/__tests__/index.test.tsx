import { NativeModules, Platform } from 'react-native';
import type { CieIdEnvironment } from '../index';

const mockIsAppInstalled = jest.fn();
const mockLaunchCieIdForResult = jest.fn();

NativeModules.IoReactNativeCieidModule = {
  isAppInstalled: mockIsAppInstalled,
  launchCieIdForResult: mockLaunchCieIdForResult,
};
Object.defineProperty(Platform, 'OS', {
  configurable: true,
  value: 'android',
});

const { isCieIdAvailable, openCieIdApp } =
  jest.requireActual<typeof import('../index')>('../index');

const productionSignature =
  '92:D1:35:40:D4:50:F6:9F:79:2C:5F:3C:77:0A:E2:85:5B:FB:23:58:B4:47:A8:DE:06:4D:51:D0:35:8E:B6:97';

type EnvironmentTestCase = {
  label: string;
  environment?: CieIdEnvironment;
  packageName: string;
  signature: string | null;
};

const environmentTestCases: ReadonlyArray<EnvironmentTestCase> = [
  {
    label: 'the default environment',
    packageName: 'it.ipzs.cieid',
    signature: productionSignature,
  },
  {
    label: 'production',
    environment: 'production',
    packageName: 'it.ipzs.cieid',
    signature: productionSignature,
  },
  {
    label: 'preprod',
    environment: 'preprod',
    packageName: 'it.ipzs.cieid.collaudo',
    signature: null,
  },
  {
    label: 'coll',
    environment: 'coll',
    packageName: 'it.ipzs.cieid.coll',
    signature: null,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isCieIdAvailable', () => {
  it.each(environmentTestCases)(
    'checks the expected Android app for $label',
    ({ environment, packageName, signature }) => {
      if (environment === undefined) {
        isCieIdAvailable();
      } else {
        isCieIdAvailable(environment);
      }

      expect(mockIsAppInstalled).toHaveBeenCalledWith(packageName, signature);
    }
  );
});

describe('openCieIdApp', () => {
  it.each(environmentTestCases)(
    'opens the expected Android app for $label',
    ({ environment, packageName, signature }) => {
      const forwardUrl = 'https://example.com/cie-id';
      const callback = jest.fn();

      if (environment === undefined) {
        openCieIdApp(forwardUrl, callback);
      } else {
        openCieIdApp(forwardUrl, callback, environment);
      }

      expect(mockLaunchCieIdForResult).toHaveBeenCalledWith(
        packageName,
        'it.ipzs.cieid.BaseActivity',
        signature,
        forwardUrl,
        callback
      );
    }
  );
});

import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * In case of error, the {@link openCieIdApp} method returns an object whos `id` property is set to `'ERROR'`.
 * In this case the object will have a `code` property that will be one of the following error codes.
 */
export type CieIdModuleErrorCodes =
  | 'GENERIC_ERROR'
  | 'REACT_ACTIVITY_IS_NULL'
  | 'CIEID_ACTIVITY_IS_NULL'
  | 'CIEID_SIGNATURE_MISMATCH'
  | 'CIE_NOT_REGISTERED'
  | 'AUTHENTICATION_ERROR'
  | 'NO_SECURE_DEVICE'
  | 'CIEID_EMPTY_URL_AND_ERROR_EXTRAS'
  | 'CIEID_OPERATION_CANCEL'
  | 'CIEID_OPERATION_NOT_SUCCESSFUL'
  | 'UNKNOWN_EXCEPTION';

/**
 * The result of the {@link openCieIdApp} method, coming from the callback,
 * is a union type of two possible results (see {@link CieIdReturnType}).
 * In case of error, the object will be the following.
 */
export type CieIdErrorResult = {
  id: 'ERROR';
  code: CieIdModuleErrorCodes;
  userInfo?: Record<string, string>;
};
/**
 * The result of the {@link openCieIdApp} method, coming from the callback,
 * is a union type of two possible results (see {@link CieIdReturnType}).
 * In case of success, the object will be the following.
 * The `url` property is the `URL` that the CieID app will return to the calling app,
 * after the authentication process is completed.
 */
export type CieIdSuccessResult = {
  id: 'URL';
  url: string;
};

/**
 * The result of the {@link openCieIdApp} coming from the callback.
 */
export type CieIdReturnType = CieIdErrorResult | CieIdSuccessResult;
export interface Spec extends TurboModule {
  isAppInstalled(appScheme: string, signature?: string | null): boolean;
  launchCieIdForResult(
    packageName: string,
    className: string,
    url: string,
    resultCallback: (result: CieIdReturnType) => void,
    signature?: string | null
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IoReactNativeCieid');

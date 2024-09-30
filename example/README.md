This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Android Login Flow

The test CieId login flow is as follows:

```mermaid
sequenceDiagram
    participant C as Citizen
    participant App
    participant WV as WebView
    participant IOBE as SP
    participant CIEIDBE as CieID Backend
    participant CieID as App CieID
    participant OS as Android

    C->>App: Start CieID identification

    App->>WV: GET https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2
    WV-->>CIEIDBE: https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/Redirect/SSO?SAMLRequest=[...]]
    WV-->>WV: Wait for `livello2` query param
    CIEIDBE-->>WV: https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2
    WV-->>WV: Stop navigation inside the WebView
    WV->>OS: OPEN through Android Intent <BR /> https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2 <BR /> with CieID

    OS-->>CieID: Open CieID
    CieID-->>CieID: Handle Identification for https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2
    alt CieID identification Error <BR /> coming through onActivityResult with RESULT_OK and "ERROR" key inside Intent data.
        Note right of CieID: ⚠️ Check what happens in this case. <BR /> RedirectionError.GENERIC_ERROR.code <BR /> RedirectionError.CIE_NOT_REGISTERED.code <BR /> RedirectionError.AUTHENTICATION_ERROR.code <BR /> RedirectionError.NO_SECURE_DEVICE.code <BR />
    else CieID identification Success
        CieID-->>C: Show success screen with "Continue" CTA
    end
    C->>CieID: Tap on "Continue"
    CieID->>OS: SEND RESULT TO CALLER APP: <BR /> RESULT_OK and key "URL" with value https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2 <BR /> Inside Intent Data
    OS-->>App: Return to App App
    App-->>App: OBTAIN https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2 from Intent Data
    App-->>WV: GET https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2"
    WV-->>C: Show /acs
```

## iOS Login Flow

The test CieId login flow is as follows:

```mermaid
sequenceDiagram
    participant C as Citizen
    participant App
    participant WV as WebView
    participant IOBE as SP
    participant CIEIDBE as CieID Backend
    participant CieID as App CieID
    participant OS as iOS

    C->>App: Start CieID identification
    App->>WV: GET https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2
    WV-->>CIEIDBE: https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/Redirect/SSO?SAMLRequest=[...]]
    WV-->>WV: Wait for `livello2` query param
    CIEIDBE-->>WV: https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2
    WV-->>WV: Add `sourceApp=iologincie` query param
    Note right of WV: https://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2&sourceApp=iologincie
    WV-->>WV: Append scheme `CIEID://`
    Note right of WV: CIEID://https:idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2&sourceApp=iologincie
    WV-->>WV: Stop navigation inside the WebView
    WV->>OS: OPEN CIEID://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2&sourceApp=iologincie
    OS-->>CieID: Open CieID
    CieID-->>CieID: Handle Identification for CIEID://idserver.servizicie.interno.gov.it/idp/login/livello2?opId=...&challenge=...&level=2&SPName=https%3A%2F%2Fapp-backend.io.italia.it&SPLogo=...&value=e1s2&sourceApp=iologincie
    alt CieID identification Error
        Note right of CieID: ⚠️ Check what happens in this case. <br/> Es: "iologincie://https://idserver.servizicie.interno.gov.it/cieiderror?cieid_error_message=Operazione_annullata_dall'utente" <br/>
    else CieID identification Success
        CieID-->>C: Show success screen with "Continue" CTA
    end
    C->>CieID: Tap on "Continue"
    CieID->>OS: OPEN iologincie://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
    OS-->>App: Return to App App
    App-->>App: Handle iologincie://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
    Note right of App: Replace iologincie:// with https://
    App-->>WV: GET https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2"
    WV-->>C: Show /acs
```

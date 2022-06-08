import React, { useCallback, useState } from "react";
import "./src/utils/IngoreLogBox";

import AppLoading from "expo-app-loading";
import { useFonts } from 'expo-font';

import RootNavigation from "./src/navigations/RootNavigation";

import { SafeAreaProvider } from "react-native-safe-area-context";
import LoadingProvider from "./src/providers/LoadingProvider";
import { Provider } from 'react-redux';

import FirebaseProvider from './src/providers/FirebaseProvider';
import UserProvider from './src/providers/UserProvider';

import store from './src/redux/Store';
import { TailwindProvider } from 'tailwind-rn/dist';
import utilities from './tailwind.json';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import tailwindConfig from "./tailwind.config";
import { requestPermissionsAsync } from "expo-notifications";
import { Platform } from "react-native";

export default function App() {
  const [loaded] = useFonts({
    Poppins: require('./assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
    PoppinsItalic: require('./assets/fonts/Poppins-Italic.ttf')
  });

  const [isReady, setIsReady] = useState<boolean>(false);

  const tailwindExtensions = {
    "box-card-shadow": {
      style: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        borderRadius: 10,
        borderWidth: 0,
        elevation: 3,
      }
    },
    "elevation-5": {
      style: {
        elevation: 5,
      },
    },
    "scroll-padding": {
      style: {
        paddingTop: 3,
        paddingLeft: 3,
        paddingRight: 3,
      },
    }
  }

  const init = useCallback(async () => {
    // remove this line and add your your code to load before removing the splashscreen
    if (Platform.OS !== "web") {
      const { status } = await requestPermissionsAsync();
    }

    // await Sleep(5000);
  }, []);

  const paperTheme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: tailwindConfig.theme.extend.colors.primary,
      accent: tailwindConfig.theme.extend.colors.cream,
    },
  };

  if (!isReady || !loaded) {
    return (
      <AppLoading
        startAsync={init}
        onFinish={() => setIsReady(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <Provider store={store}>
      <FirebaseProvider>
        <UserProvider>
          <TailwindProvider utilities={{ ...utilities, ...tailwindExtensions }}>
            <PaperProvider theme={paperTheme}>
              <LoadingProvider>
                <SafeAreaProvider>
                  <RootNavigation />
                </SafeAreaProvider>
              </LoadingProvider>
            </PaperProvider>
          </TailwindProvider>
        </UserProvider>
      </FirebaseProvider>
    </Provider>
  );
}

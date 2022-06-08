import React, { useEffect } from "react";

import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigation from "./MainNavigation";
import { RootRoutes } from "./NavigationProps/NavigationProps";
import { linking } from "./Links";
import LoginPage from "../features/auth/LoginScreen";
import LoadingData from "../components/atoms/loading/loadingData";
import { AUTH_LOADING, AUTH_LOGGED_IN } from "../constants/Auth";
import { Linking, Platform, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserContext } from "../providers/UserProvider";
import AuthNavigation from "./AuthNavigation";
import tailwindConfig from "../../tailwind.config";
import { useTailwind } from "tailwind-rn/dist";

const Stack = createNativeStackNavigator();

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

export default function () {
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();
  const userContext = useUserContext();
  const links: LinkingOptions<RootRoutes> = linking;

  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (Platform.OS !== 'web' && initialUrl == null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  if (userContext?.status.match(AUTH_LOADING) || !isReady) {
    return <LoadingData />
  }

  return (

      <NavigationContainer
        linking={links}
        initialState={initialState}
        onStateChange={(state) =>
          AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
        }
      >
        {
          userContext?.status == AUTH_LOGGED_IN
            ?
            <MainNavigation />
            :
            <AuthNavigation />
        }    
      </NavigationContainer>

  );
}
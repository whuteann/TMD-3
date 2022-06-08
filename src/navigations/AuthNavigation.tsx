import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "../features/auth/LoginScreen";
import ForgetPasswordScreen from "../features/auth/ForgetPasswordScreen";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
  </Stack.Navigator >
  );
}

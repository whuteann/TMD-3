import * as React from "react";
import {
  KeyboardAvoidingView, Platform, RefreshControl, View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn";
import { RefreshSelector } from "../../../redux/reducers/Refresh";

import { isNonScrolling, offsets, presets } from "./screen.presets";
import { ScreenProps } from "./screen.props";

function ScreenWithoutScrolling(props: ScreenProps) {
  const preset = presets.fixed;
  const style = props.style || {};
  const pointerEvents = props.pointerEvents || "auto";
  const tailwind = useTailwind();

  return (
    <KeyboardAvoidingView
      style={ tailwind("flex-1 items-start") }
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <View
        pointerEvents={pointerEvents}
        style={[preset.outer,  style]}
      >
        {props.children}
      </View>
    </KeyboardAvoidingView>
  );
}

function ScreenWithScrolling(props: ScreenProps) {
  const preset = presets.scroll;
  const style = props.style || {};

  const isRefresh = useSelector(RefreshSelector);

  return (
    <KeyboardAwareScrollView 
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="always" 
      contentContainerStyle={[style, preset.outer]}
      refreshControl={
        <RefreshControl
          refreshing={isRefresh}
          onRefresh={props.onRefresh}
        />
      }>
      { props.children }
    </KeyboardAwareScrollView>
  );
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export function Screen(props: ScreenProps) {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />;
  }
  return <ScreenWithScrolling {...props} />;
}

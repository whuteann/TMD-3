import React, {
  ForwardedRef, forwardRef, useImperativeHandle, useState,
} from "react";

import Sleep from "../../../utils/Sleep";
import { LoadingMethods, LoadingProps } from "./loading-props";
import { useTailwind } from "tailwind-rn/dist";
import { ActivityIndicator, View } from "react-native";

export type LoadingRef = LoadingMethods;

const Loading = forwardRef((props: LoadingProps, ref: ForwardedRef<LoadingRef>) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showLabel, setShowLabel] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);
  const tailwind = useTailwind();
  const shouldShow = props.open || isOpen;

  useImperativeHandle(ref, () => ({
    display: onDisplay,
    hide: onHide,
  }));

  const onDisplay = async () => {
    setIsOpen(true);
    await setTimers();
  };

  const onHide = async () => {
    setIsOpen(false);
    setShowLabel(false);
    setShowButton(false);
  };

  const setTimers = async () => {
    await Sleep(5000);
    setShowLabel(true);
    await Sleep(5000);
    setShowButton(true);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={tailwind("bg-cream w-full h-full z-10 items-center")}>
      <View style={tailwind("justify-end flex-col mt-[300px]")}>
        <ActivityIndicator size={130} color={"#EF5713"} />
      </View>
    </View>
  );
});

export default Loading;

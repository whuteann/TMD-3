import React from "react";
import { Platform, View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import { Screen } from "..";
import { SafeAreaView } from 'react-native-safe-area-context';

interface bodyProps {
  children: React.ReactNode,
  variant?: string,
  isFullScreen?: boolean,
  header?: any
  onRefresh?: () => void,
  fixedScroll?: boolean,
  style?: any,
}

const Body = (props: bodyProps) => {
  const {
    children,
    variant = 'primary',
    isFullScreen = false,
    header,
    onRefresh,
    fixedScroll = false,
    style
  } = props;

  const tailwind = useTailwind();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[
        tailwind('flex flex-grow'),
        variant == 'primary' ? tailwind('bg-cream') : tailwind('bg-white'),
        Platform.OS != 'web' ? tailwind('h-full') : null,
      ]}>

        {
          header
        }

        <Screen 
          preset={Platform.OS == 'web' || fixedScroll ? 'fixed' : 'scroll'}
          onRefresh={onRefresh}>
          <View style={[
            tailwind('w-4/5 mx-auto mb-5'),
            style,
            isFullScreen ? tailwind('md:w-full') : tailwind('md:w-96')
          ]}>
            {children}
          </View>
        </Screen>
      </View>
    </SafeAreaView>
  );
}

export default Body;
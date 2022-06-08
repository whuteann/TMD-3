import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowBackIcon, LogoIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';

interface HeaderProps {
  navigateProp: any,
  title: string
  navigateToDashboard?: boolean,
}

const HeaderStack: React.FC<HeaderProps> = ({
  navigateProp, title, navigateToDashboard = false
}) => {

  const tailwind = useTailwind();

  return (
    <View style={tailwind("box-card-shadow bg-white w-full flex-row items-center rounded-none")}>
      <View style={tailwind("w-[25%] pl-5")}>
        {
          Platform.OS == "web"
            ?
            (
              <TouchableOpacity onPress={() => navigateProp.navigate("Dashboard")} >
                <LogoIcon width={40} height={40} />
              </TouchableOpacity>
            )
            :
            (
              <TouchableOpacity onPress={() => { navigateToDashboard ? navigateProp.navigate("Dashboard") : navigateProp.goBack() }} >
                <ArrowBackIcon height={25} width={25} />
              </TouchableOpacity>
            )
        }
      </View>
      <View style={tailwind("items-center flex-row py-3 w-[50%]")} >
        <TextLabel content={title} style={tailwind("font-bold text-16px text-center")} />
      </View>
    </View>
  );
}

export default HeaderStack;
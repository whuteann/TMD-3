import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowBackIcon, LogoIcon, LogoutIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';
import { auth } from '../../../functions/Firebase';

interface HeaderProps {
  navigateProp: any,
  title: string
}

const StrangerStack: React.FC<HeaderProps> = ({
  navigateProp, title
}) => {
  const tailwind = useTailwind();

  const handleSignOut = () => {
    auth.signOut().then(() => {

    }).catch((error) => {
    
    });
  }

  return (
    <View style={tailwind("box-card-shadow bg-white w-full flex-row items-center rounded-none")}>
      <View style={tailwind("w-[25%] pl-5")}>
        <TouchableOpacity onPress={() => { handleSignOut() }}>
          <View style={tailwind("my-2")}>
              <LogoutIcon height={25} width={25} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={tailwind("items-center flex-row py-3 w-[50%]")} >
        <TextLabel content={title} style={tailwind("font-bold text-16px text-center")} />
      </View>
    </View>
  );
}

export default StrangerStack;
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { BellIcon, LogoIcon, MenuIcon } from '../../../../assets/svg/SVG';
import { getWindow } from '../../../helpers/GenericHelper';
import { useTailwind } from 'tailwind-rn/dist';
import NotificationButton from './notification/NotificationButton';


interface HeaderProps {
  left: {
    onPress: () => void;
  };
  middle: {
    onPress: () => void;
  };
  navigation: any,
}

const HeaderDashboard: React.FC<HeaderProps> = ({
  left, middle, navigation
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("bg-white h-14 flex-row items-center justify-around box-card-shadow rounded-none xl:hidden")}>
      <View style={tailwind("pr-[3.3rem]")}>
        <TouchableOpacity onPress={left.onPress} >
          <MenuIcon height={35} width={35} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={middle.onPress}>
          <LogoIcon height={50} width={50} />
        </TouchableOpacity>
      </View>
      <View style={tailwind("pl-16")}>
        <NotificationButton navigation={navigation} />
      </View>
    </View>
  );
}


export default HeaderDashboard;
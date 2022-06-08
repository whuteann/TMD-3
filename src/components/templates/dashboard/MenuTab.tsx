import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';

interface inputProps {
  icon: any,
  text: string,
  onPress: () => void,
}

const MenuTab: React.FC<inputProps> = ({
  text, icon, onPress
}) => {
  const tailwind = useTailwind();

  return (

    <TouchableOpacity onPress={onPress} style={tailwind("w-full sm:w-1/3 lg:w-1/2 xl:w-1/3")} >

      <View style={tailwind("px-2 pt-2")}>
        <View style={tailwind("bg-white border-0 box-card-shadow flex-col items-center justify-center p-5 mb-5 h-36")}>
          <View style={tailwind("h-12")}>
            {icon}
          </View>
          <View style={tailwind("flex-col mt-1 items-center w-[95%]")}>
            <TextLabel content={text} style={tailwind("font-bold text-center flex-wrap")} />
          </View>
        </View>
      </View>

    </TouchableOpacity>
  )
}

export default MenuTab;
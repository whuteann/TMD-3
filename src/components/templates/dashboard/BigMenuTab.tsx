import React from 'react';
import {TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';

interface inputProps {
  title: string,
  text: any,
  icon: any,
  onPress: () => void,
}

const BigMenuTab: React.FC<inputProps> = ({
  onPress, title, text, icon
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={onPress} style={tailwind("w-full sm:w-[48%] mb-5")}>
      <View style={ tailwind("box-card-shadow bg-white p-5 flex-row sm:flex-row md:flex-col lg:flex-col items-center sm:items-center md:items-start") }>
        <View  >
          {icon}
        </View>

        <View style={ tailwind("flex-col items-start w-[80%] pl-3")}>
          <TextLabel content={title} style={tailwind("font-bold text-16px")}/>
          
          {text}
        </View>
      </View>
    </TouchableOpacity>

  )
}

export default BigMenuTab;
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';

interface InfoProps {
  placeholder: string,
  info: string | null | undefined,
  linkOnPress: () => void,
  style?: any,
  radioButton?: boolean
}

const InfoDisplayLink: React.FC<InfoProps> = ({
  placeholder, info, linkOnPress, style
}) => {
  const tailwind = useTailwind();
  let display;

  display = (
    <View style={tailwind("flex-row w-7/12")}>
      <TextLabel content={`:`} style={[tailwind("w-auto mr-3")]} />
      <TouchableOpacity style={tailwind("w-9/12")} onPress={linkOnPress}>
        <TextLabel
          content={`${info}`}
          style={[tailwind("underline text-primary font-bold w-full")]}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <View style={tailwind("flex-row mb-1")}>
        <View style={[tailwind("w-6/12"), style]} >
          <View>
            <TextLabel content={placeholder} />
          </View>
        </View>
        {display}
      </View>
    </View>
  )
}

export default InfoDisplayLink;
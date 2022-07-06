import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';

interface InfoProps {
  placeholder: string,
  info: string | null | undefined,
  bold?: boolean,
  style?: any,
  secondLine?: string
}

const InfoDisplay: React.FC<InfoProps> = ({
  placeholder, info, bold = false, style, secondLine = ""
}) => {
  const tailwind = useTailwind();
  let display;

  display = (
    <View style={tailwind("w-7/12")}>
      <View style={tailwind("flex-row")}>
        <TextLabel content={`:`} style={[bold ? tailwind("font-bold") : null, tailwind("w-auto mr-3")]} />
        <TextLabel
          content={`${info}`}
          style={[bold ? tailwind("font-bold") : null, tailwind("w-9/12")]} />
      </View>
      {
        secondLine
          ?
          <View style={tailwind("flex-row")}>
            <View style={tailwind("mr-4")} />
            <TextLabel
              content={`${secondLine}`}
              style={[bold ? tailwind("font-bold") : null, tailwind("w-9/12")]} />
          </View>
          :
          <></>
      }

    </View>
  );


  return (
    <View>
      <View style={tailwind("flex-row mb-1")}>
        <View style={[tailwind("w-6/12"), style]} >
          <View>
            <TextLabel content={placeholder} style={[bold ? tailwind("font-bold") : null]} />
          </View>
        </View>
        {display}
      </View>
    </View>
  )
}

export default InfoDisplay;
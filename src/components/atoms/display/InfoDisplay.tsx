import React from 'react';
import {  View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';

interface InfoProps {
  placeholder: string,
  info: string | null | undefined,
  bold?: boolean
  style?: any
}

const InfoDisplay: React.FC<InfoProps> = ({
  placeholder, info, bold = false, style
}) => {
  const tailwind = useTailwind();
  let display;

  display = (
    <View style={tailwind("flex-row w-7/12")}>
      <TextLabel content={`:`} style={[bold ? tailwind("font-bold") : null, tailwind("w-auto mr-3")]} />
      <TextLabel
       content={`${info}`}
        style={[bold ? tailwind("font-bold") : null, tailwind("w-9/12")]} />
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
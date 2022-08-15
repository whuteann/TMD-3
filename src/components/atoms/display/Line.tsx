import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';


interface lineProps { }

const Line: React.FC<lineProps> = ({ }) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
  )
}

export default Line;
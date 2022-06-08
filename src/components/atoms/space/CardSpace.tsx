import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';

const CardSpace: React.FC = ({
}) => {
  const tailwind = useTailwind();

  return (
    <View style={ tailwind('my-2') }></View>
  );
}

export default CardSpace;
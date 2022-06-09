import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';

interface noDataProps {
  content?: string,
  style?: any
}

const NoData: React.FC<noDataProps> = ({
  content = 'No data available',
  style
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('w-full mt-3')}>
      <TextLabel 
        content={content} 
        color='text-gray-primary'
        alignment='text-center' /> 
    </View>
  )
}

export default NoData;
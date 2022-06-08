import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  name: string,
  description: string,
}

const CustomerSegmentationTab: React.FC<inputProps> = ({
  navigate, name, description,
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={tailwind('flex flex-row bg-white rounded-lg items-center mt-2 p-3 box-card-shadow')}>
        <View style={tailwind('w-full flex flex-row items-center')}>
          <View style={tailwind('w-full')}>
            <TextLabel content={name} style={tailwind('font-bold')} />

            <TextLabel content={`Description: ${description || "-"}`} style={tailwind('text-gray-primary')} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default CustomerSegmentationTab;

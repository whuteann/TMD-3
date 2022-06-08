import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  code: string,
  reason: string,
}

const UnawardedRFQReasonTab: React.FC<inputProps> = ({
  navigate, code, reason,
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={tailwind('flex flex-row bg-white rounded-lg items-center mt-2 p-3 box-card-shadow')}>
        <View style={tailwind('w-full flex flex-row items-center')}>
          <View style={tailwind('w-full')}>
            <TextLabel content={reason} style={tailwind('font-bold')} />

            <TextLabel content={`Code: ${code}`} style={tailwind('text-gray-secondary')} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default UnawardedRFQReasonTab;

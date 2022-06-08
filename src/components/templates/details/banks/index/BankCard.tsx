import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  name: string,
  address: string,
  accNo: string,
  swiftCode: string,
}

const BankCard: React.FC<inputProps> = ({
  navigate, name, address, accNo, swiftCode
}) => {
  const tailwind = useTailwind();
  return (
    <TouchableOpacity onPress={navigate}>
      <View style={tailwind('flex flex-row bg-white rounded-lg items-center mt-2 p-3 box-card-shadow')}>
        <View style={tailwind('w-full flex flex-row items-center')}>
          <View style={tailwind('w-full')}>
            <TextLabel content={name} style={tailwind('font-bold')} />

            <TextLabel content={address} style={tailwind('text-gray-primary')} />

            <TextLabel content='Account Information:' style={tailwind('font-bold')} />

            <View style={tailwind('flex flex-row')}>
              <TextLabel content='Bank Account No' />
              <TextLabel content={`: ${accNo}`} />
            </View>

            <View style={tailwind('flex flex-row')}>
              <TextLabel content='Swift Code' />
              <TextLabel content={`: ${swiftCode}`} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default BankCard;
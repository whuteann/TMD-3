import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowRightIcon } from '../../../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface cardProps {
  title: string,
  navigate: () => void,
}

const PaymentTermCard: React.FC<cardProps> = ({
  title, navigate
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View
        style={tailwind('bg-white flex flex-row justify-between items-center box-card-shadow rounded-lg p-3')}>
        <View style={tailwind('flex flex-col')}>
          <TextLabel content={title} style={tailwind('font-bold')} />
        </View>
        <ArrowRightIcon height={18} width={18} />
      </View>
    </TouchableOpacity>
  );
}

export default PaymentTermCard;

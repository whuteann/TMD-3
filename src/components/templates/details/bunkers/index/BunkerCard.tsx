import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowRightIcon } from '../../../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface cardProps {
  title: string,
  status: string,
  navigate: () => void,
}

const BunkerCard: React.FC<cardProps> = ({
  title, navigate, status
}) => {
  const tailwind = useTailwind();

  var color;
  if (status == "inactive") {
    color = "#fa8e8e";
  } else if (status == "active") {
    color = "#c1ffa6";
  } else {
    color = "bg_secondary";
  }

  return (
    <TouchableOpacity onPress={navigate}>
      <View
        style={tailwind('bg-white flex flex-row justify-between items-center box-card-shadow rounded-lg p-3')}>
        <View style={tailwind('flex flex-col')}>
          <TextLabel content={title} style={tailwind('font-bold')} />

          {
            status == "" 
              ? 
                null 
              :
                <TextLabel content={`Status: ${status}`} style={tailwind('font-bold')} />
          }
        </View>

        <ArrowRightIcon height={18} width={18} />
      </View>
    </TouchableOpacity>
  );
}

export default BunkerCard;

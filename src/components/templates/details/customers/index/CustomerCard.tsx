import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { ArrowRightIcon } from '../../../../../../assets/svg/SVG';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface cardProps {
  name: string,
  status: string,
  navigate: () => void,
}

const CustomerCard: React.FC<cardProps> = ({
  name, navigate, status
}) => {
  const tailwind = useTailwind();

  var color;
  if (status.toLowerCase() == "inactive") {
    color = "#fa8e8e";
  } else if (status.toLowerCase() == "active") {
    color = "#c1ffa6";
  } else {
    color = "bg_secondary";
  }

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={[
        tailwind('w-full flex flex-row box-card-shadow justify-between py-2 px-3'),
        { backgroundColor: color }
      ]}>
        <View style={tailwind('flex flex-col w-[80%]')}>
          <TextLabel content={name} style={tailwind('font-bold')} />
          {
            status == ""
              ?
              null
              :
              <View style={tailwind('flex flex-row w-full')}>
                <TextLabel content='Status:' style={tailwind("w-[23%]")} />
                <TextLabel content={status} style={tailwind('font-bold ')} />
              </View>
          }
        </View>

        <View style={tailwind('self-center')}>
          <ArrowRightIcon height={18} width={18} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default CustomerCard;

import React, { useState } from 'react';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import TextLabel from '../../atoms/typography/TextLabel';

interface MonthTabViewProps {
  month: string,
  items: any,
}

const MonthTabView: React.FC<MonthTabViewProps> = ({
  month, items
}) => {
  const [open, setOpen] = useState(true);
  const tailwind = useTailwind();

  return (
    <View style={tailwind("w-full")}>
      {/* <TouchableOpacity onPress={() => {  setOpen(!open); }}> */}
        <View style={tailwind("pt-2 flex-row items-center")}>
          <View style={tailwind("w-full")}>
            <TextLabel content={month} color={"text-gray-primary"} style={tailwind("text-22px font-bold")} />
          </View>
          {/* {open ?
            <View style={{ marginLeft: 6 }}>
              <XSimpleIcon height={9} width={9} />
            </View>
            :
            <View style={{ paddingBottom: 1 }}>
              <PlusSimpleIcon height={21} width={21} />
            </View>
          } */}
        </View>
      {/* </TouchableOpacity> */}
      {/* {open ? */}
        {items}
        {/* : null} */}
    </View>
  );
}

export default MonthTabView;
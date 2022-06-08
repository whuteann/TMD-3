import React from 'react';
import {  Platform, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../../atoms/typography/TextLabel';

interface inputProps {
  navigate: () => void,
  secondaryId: string,
  confirmedDate: string,
  customerName: string,
  contactPersonName: string,
  status: string,
}

const SaleCard: React.FC<inputProps> = ({
  navigate, 
  secondaryId, 
  confirmedDate,
  customerName,
  contactPersonName,
  status
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={navigate}>
      <View style={[tailwind("box-card-shadow rounded-lg p-2 bg-white mt-2 mb-5")]}>

        <View style={tailwind("flex-row pr-3")}>
          <View>
            <TextLabel content={confirmedDate} style={tailwind("italic text-12px text-gray-400")} />
            <View style={tailwind("flex-row items-center")}>
              <View>
                <TextLabel content={`${secondaryId}`} style={tailwind("text-xl font-bold text-18px")} />
              </View>
            </View>
          </View>
        </View>

        <View >
          <View style={tailwind("flex-row flex")}>
            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${customerName}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-2")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${contactPersonName}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${status || "Confirmed"}`} style={tailwind("italic text-12px text-gray-400 w-4/12 flex-wrap")} />
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
}

export default SaleCard;
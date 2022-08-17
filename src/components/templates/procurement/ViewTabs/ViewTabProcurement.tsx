import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowDownIcon, CreateIcon, DownloadIcon, PreviewIcon } from '../../../../../assets/svg/SVG';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import { REQUESTING } from '../../../../types/Common';

interface inputProps {
  id: string,
  nav_id: string,
  org: string,
  status: string,
  navigation: any,
  date: string,
}

const ViewTabProcurement: React.FC<inputProps> = ({
  id, org, status, navigation, date, nav_id
}) => {
  const tailwind = useTailwind();
  const [dropdown, setDropdown] = useState(false);

  let dropdowns = <></>;

  let route = "ViewProcurementSummary";
  let path = () => { setDropdown(!dropdown) };

  if (status == REQUESTING) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Procurement" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<CreateIcon height={24} width={24} />} text="Edit Procurement" setDropdown={path} navigation={() => { navigation.navigate("EditProcurement", { docID: nav_id }) }} />
      </View>
    )
  } else {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Procurement" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
      </View>
    )
  }


  return (
    <TouchableOpacity onPress={path}>
      <View style={[tailwind("box-card-shadow rounded-lg pt-2 pl-2 bg-white mt-2 mb-5")]}>

        <View style={tailwind("flex-row pr-3")}>
          <View style={tailwind("flex w-[90%]")}>
            <TextLabel content={`${date}`} style={tailwind("italic text-12px text-gray-400")} />
            <View style={tailwind("flex-row items-center")}>
              <View style={tailwind("flex-wrap w-full")}>
                <TextLabel content={id || ""} style={tailwind("text-xl font-bold text-18px")} />
              </View>
            </View>
          </View>
          <View style={tailwind("flex-grow items-end pt-4")}>
            <ArrowDownIcon width={17} height={17} />
          </View>
        </View>

        <View style={tailwind("flex-row")}>

          <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
          <TextLabel content={`${org}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/2 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/2 flex-wrap mr-2")} />

          <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
          <TextLabel content={`${status}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/2 flex-wrap mr-2") : tailwind("italic text-12px text-gray-400 w-3/6 flex-wrap")} />

        </View>

        <View style={tailwind("pl-1 mt-3")}>
          {dropdown ? dropdowns : null}
        </View>

      </View>
    </TouchableOpacity>
  )
}

export default ViewTabProcurement;
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ArrowDownIcon, DownloadIcon, PreviewIcon } from '../../../../../assets/svg/SVG';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { generateJobConfirmationAAPDF } from '../../pdf/generateJobConfirmationAAPDF';
import { generateJobConfirmationOPPDF } from '../../pdf/generateJobConfirmationOPPDF';
import { createAndDisplayPDF } from '../../../../functions/PDFv2Functions';
import { ACCOUNT_ASSISTANT_ROLE, NO_INVOICE, OPERATION_TEAM_ROLE } from '../../../../types/Common';

interface inputProps {
  id: string | undefined,
  org: string | undefined,
  name: string | undefined,
  status: string | undefined,
  navigation: any,
  date: string | undefined,
  data: any
  nav_id: string | undefined,
}

const ViewTabJob: React.FC<inputProps> = ({
  id, org, name, status, navigation, date, data, nav_id
}) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const [dropdown, setDropdown] = useState(false);

  let route: any;
  let path: () => void;


  route = "JobConfirmationSummary";
  path = () => { setDropdown(!dropdown) };

  const onDownload = async () => {
    let html: any;

    if (user?.role == ACCOUNT_ASSISTANT_ROLE) {
      html = generateJobConfirmationAAPDF(data);
    } else if (user?.role == OPERATION_TEAM_ROLE) {
      html = generateJobConfirmationOPPDF(data);
    } else {
      // Should return something else
      html = generateJobConfirmationOPPDF(data);
      // html = generateJobConfirmationAAPDF(data);
    }

    await createAndDisplayPDF(html);
  }

  let dropdowns;

  dropdowns = (
    <View>
      <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Job Confirmation" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
      {
        status == NO_INVOICE
          ?
          <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Job Confirmation" setDropdown={path} navigation={() => { onDownload(); }} />
          :
          <></>
      }
    </View>
  )


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

        <View >
          <View style={tailwind("flex-row")}>
            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${org}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-2")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/6 flex-wrap mr-2") : tailwind("italic text-12px text-gray-400 w-3/6 flex-wrap")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${status}`} style={tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap")} />
          </View>
        </View>

        <View style={tailwind("pl-1 mt-3")}>
          {dropdown ? dropdowns : null}
        </View>

      </View>
    </TouchableOpacity>
  )
}


export default ViewTabJob;
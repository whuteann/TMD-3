import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowDownIcon, CreateIcon, DownloadIcon, PreviewIcon } from '../../../../../assets/svg/SVG';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import TextLabel from '../../../atoms/typography/TextLabel';
import { useTailwind } from 'tailwind-rn/dist';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { generateOfficialReceiptPDF } from '../../pdf/generateOfficialReceiptPDF';

interface inputProps {
  id: string,
  display_id: string,
  org: string,
  name: string,
  navigation: any,
  date: string,
  data: any
}

const ViewTabReceipt: React.FC<inputProps> = ({
  id, org, name, navigation, date, display_id, data
}) => {
  const tailwind = useTailwind();
  const [dropdown, setDropdown] = useState(false);

  let route: any;
  let path: () => void;


  route = "ViewReceiptSummary";
  path = () => { setDropdown(!dropdown) };

  const onDownload = async () => {
    let image = await loadPDFLogo();
    let html = generateOfficialReceiptPDF(data, image);
    await createAndDisplayPDF(html);
  }

  let dropdowns;

  dropdowns = (
    <View>
      <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Receipt" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: id }) }} />
      <ViewTabDropdown icon={<CreateIcon height={25} width={25} />} text="Edit Receipt" setDropdown={path} navigation={() => { navigation.navigate("EditOfficialReceipt", { docID: id }) }} />
      <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Receipt" setDropdown={path} navigation={() => { onDownload() }} />
    </View>
  )

  return (
    <TouchableOpacity onPress={path}>
      <View style={[tailwind("box-card-shadow rounded-lg pt-2 pl-2 bg-white mt-2 mb-5")]}>
        <View style={tailwind("flex-row pr-3")}>
          <View>
            <TextLabel content={`${date}`} style={tailwind("italic text-12px text-gray-400")} />
            <View style={tailwind("flex-row items-center")}>
              <View>
                <TextLabel content={display_id || ""} style={tailwind("text-xl font-bold text-18px")} />
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
          <TextLabel content={`${name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/2 flex-wrap mr-2") : tailwind("italic text-12px text-gray-400 w-3/6 flex-wrap")} />
        </View>

        <View style={tailwind("pl-1 mt-3")}>
          {dropdown ? dropdowns : null}
        </View>

      </View>
    </TouchableOpacity>
  )
}

export default ViewTabReceipt;
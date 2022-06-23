import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ArrowRightIcon } from '../../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { generatePDFQuotation } from '../../pdf/generateQuotationPDF';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';

interface inputProps {
  nav_id: string | undefined,
  org: string | undefined,
  name: string | undefined,
  navigation: any | undefined,
  date: string | undefined,
}

const ViewTabSales: React.FC<inputProps> = ({
  org, name, navigation, date, nav_id
}) => {
  const tailwind = useTailwind();
  const [dropdown, setDropdown] = useState(false);
  const user = useSelector(UserSelector);

  let route: any;
  let path: () => void;


  const onDownload = async (data) => {
    let image = await loadPDFLogo();

    let html = generatePDFQuotation(data, image);

    await createAndDisplayPDF(html);
  }



  return (
    <TouchableOpacity onPress={() => { navigation.navigate("SalesSummary", {docID: nav_id}) }}>
      <View style={[
        tailwind('w-full flex flex-row box-card-shadow justify-between py-2 px-3 bg-white mb-5'),
      ]}>
        <View style={tailwind('flex flex-col w-[80%]')}>
          <TextLabel content={org!} style={tailwind('text-18px font-bold')} />
          <View style={tailwind('flex flex-row w-full')}>
            <TextLabel content={date!} style={tailwind("w-1/3")} />
            <View style={tailwind("flex-wrap w-2/3")}>
              <TextLabel content={name!} />
            </View>
          </View>
        </View>

        <View style={tailwind('self-center')}>
          <ArrowRightIcon height={18} width={18} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ViewTabSales;
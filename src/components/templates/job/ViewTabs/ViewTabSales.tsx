import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowDownIcon, ArrowRightIcon, CreateIcon, DownloadIcon, FolderIcon, PreviewIcon, ProceedIcon, TrashIcon } from '../../../../../assets/svg/SVG';
import { deleteQuotation } from '../../../../services/QuotationServices';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { generatePDFQuotation } from '../../pdf/generateQuotationPDF';
import { useLinkTo } from '@react-navigation/native';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import { QUOTATIONS } from '../../../../constants/Firebase';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { APPROVED, ARCHIVED, CONFIRMED, DRAFT, IN_REVIEW, REJECTED } from '../../../../types/Common';

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
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTailwind } from 'tailwind-rn/dist';
import { ArrowDownIcon, DownloadIcon, PreviewIcon, PVIcon } from '../../../../../assets/svg/SVG';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { EDIT_DRAFT } from '../../../../permissions/Permissions';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { APPROVED, APPROVED_DOC, DRAFT, DOC_SUBMITTED, IN_REVIEW, NO_PURCHASE_VOUCHER, PV_ISSUED, REJECTED, VERIFIED, VERIFIED_DOC } from '../../../../types/Common';
import TextLabel from '../../../atoms/typography/TextLabel';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import { generateSparesPurchaseOrderPDF } from '../../pdf/generateSparesPurchaseOrderPDF';

interface inputProps {
  id: string,
  org: string,
  nav_id: string,
  status: string,
  name: string,
  navigation: any,
  date: string,
  data: any,
}

const ViewTabSparesPO: React.FC<inputProps> = ({
  id, org, status, nav_id, navigation, date, name, data
}) => {

  const [dropdown, setDropdown] = useState(false);
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  let dropdowns;

  const onDownload = async (data) => {
    let image = await loadPDFLogo();
    let html = generateSparesPurchaseOrderPDF(data, image);
    await createAndDisplayPDF(html);
  }

  let route = "ViewSparesPurchaseOrderSummary";
  let path = () => { setDropdown(!dropdown) };


  if (status == IN_REVIEW) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload(data); }} />
      </View>
    )

  } else if (status == APPROVED || status == VERIFIED || status == VERIFIED_DOC || status == DOC_SUBMITTED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload(data); }} />
      </View>
    )
  } else if (status == REJECTED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Edit Purchase Order" setDropdown={path} navigation={() => { navigation.navigate("EditSparesPurchaseOrder", { docID: nav_id }) }} />
      </View>
    )
  } else if (status == APPROVED_DOC) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<PVIcon height={25} width={25} />} text="Create Purchase Voucher" setDropdown={path} navigation={() => { navigation.navigate("CreateSparesPurchaseVoucherForm", { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload(data); }} />
      </View>
    )
  } else if (status == PV_ISSUED || status == NO_PURCHASE_VOUCHER) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload(data); }} />
      </View>
    )
  } else if (status == DRAFT) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        {
          user?.id == data.created_by.id || user?.permission?.includes(EDIT_DRAFT)
            ?
            <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload(data); }} />
            :
            <></>
        }
      </View>
    )
  }

  return (
    <TouchableOpacity onPress={path}>
      <View style={[tailwind("box-card-shadow rounded-lg p-2 bg-white mt-2 mb-5")]}>

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
          <View style={tailwind("flex-row flex")}>

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${org}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-1/3 flex-wrap mr-2")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${name}`} style={Platform.OS != "web" ? tailwind("italic text-12px text-gray-400 w-1/6 flex-wrap mr-1") : tailwind("italic text-12px text-gray-400 w-2/6 flex-wrap mr-4")} />

            <TextLabel content={`•`} style={tailwind("italic text-12px text-gray-400 w-auto mr-1")} />
            <TextLabel content={`${status}`} style={tailwind("italic text-12px text-gray-400 w-4/12 flex-wrap")} />

          </View>
        </View>

        <View style={tailwind("pl-1 mt-3")}>
          {dropdown ? dropdowns : null}
        </View>

      </View>
    </TouchableOpacity>
  )
}


export default ViewTabSparesPO;
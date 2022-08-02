import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowDownIcon, DownloadIcon, PreviewIcon, PVIcon } from '../../../../../assets/svg/SVG';
import ViewTabDropdown from '../../../molecules/buttons/ViewTabDropdown';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import { APPROVED, DRAFT, IN_REVIEW, NO_PURCHASE_VOUCHER, REJECTED, UserRole } from '../../../../types/Common';
import { createAndDisplayPDF, loadPDFLogo } from '../../../../functions/PDFv2Functions';
import { generatePurchaseOrderPDF } from '../../pdf/generatePurchaseOrderPDF';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../../redux/reducers/Auth';
import { EDIT_DRAFT } from '../../../../permissions/Permissions';

interface inputProps {
  id: string,
  nav_id: string,
  org: string,
  name: string,
  status: string,
  data: any,
  navigation: any,
  date: string,
}

const ViewTabPO: React.FC<inputProps> = ({
  id, org, name, status, navigation, date, nav_id, data
}) => {

  const [dropdown, setDropdown] = useState(false);
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const role = user?.role;
  const onDownload = async () => {
    let image = await loadPDFLogo();
    let html = generatePurchaseOrderPDF(data, image);
    await createAndDisplayPDF(html);
  }

  let dropdowns;

  let route = "ViewPurchaseOrderSummary";
  let path = () => { setDropdown(!dropdown) };

  if (status == IN_REVIEW) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload() }} />
      </View>
    )
  } else if (status == APPROVED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload() }} />
      </View>
    )
  } else if (status == REJECTED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Edit Purchase Order" setDropdown={path} navigation={() => { navigation.navigate("EditPurchaseOrderForm", { docID: nav_id }) }} />
      </View>
    )
  } else if (status == DRAFT) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        {
          user?.id == data.created_by.id || user?.permission?.includes(EDIT_DRAFT)
            ?
            <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Edit Purchase Order" setDropdown={path} navigation={() => { navigation.navigate("EditPurchaseOrderForm", { docID: nav_id }) }} />
            :
            <></>
        }
      </View>
    )
  } else {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={25} width={25} />} text="Preview Purchase Order" setDropdown={path} navigation={() => { navigation.navigate(route, { docID: nav_id }) }} />
        <ViewTabDropdown icon={<DownloadIcon height={25} width={25} />} text="Download Purchase Order" setDropdown={path} navigation={() => { onDownload() }} />
        {
          (role == "Account Assistant" || role == "Head of Finance & Accounts" || role == "Super Admin") && status == NO_PURCHASE_VOUCHER
            ?
            <ViewTabDropdown icon={<PVIcon height={25} width={25} />} text="Create Purchase Voucher" setDropdown={path} navigation={() => { navigation.navigate("CreatePurchaseVoucherForm", { docID: nav_id }) }} />
            :
            null
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

export default ViewTabPO;
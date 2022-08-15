import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { ArrowDownIcon, CreateIcon, DownloadIcon, FolderIcon, PreviewIcon, ProceedIcon, TrashIcon } from '../../../../../assets/svg/SVG';
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
import { useRefreshContext } from '../../../../providers/RefreshProvider';
import { EDIT_DRAFT } from '../../../../permissions/Permissions';

interface inputProps {
  id: string,
  nav_id: string | undefined,
  org: string | undefined,
  name: string | undefined,
  status: string | undefined,
  navigation: any | undefined,
  date: string | undefined,
  data: any
}

const ViewTabQuotation: React.FC<inputProps> = ({
  id, org, name, status, navigation, date, nav_id, data
}) => {
  const tailwind = useTailwind();
  const [dropdown, setDropdown] = useState(false);
  const linkTo = useLinkTo();
  const user = useSelector(UserSelector);
  const refreshContext = useRefreshContext();

  let route: any;
  let path: () => void;

  route = "ViewQuotationSummary";
  path = status == "Confirmed" ? () => { navigation.navigate(route, { docID: nav_id }) } : () => { setDropdown(!dropdown); };

  const onDownload = async (data) => {
    let image = await loadPDFLogo();

    let html = generatePDFQuotation(data, image);

    await createAndDisplayPDF(html);
  }

  let dropdowns;

  if (status == DRAFT) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={24} width={24} />} text="Preview Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
        {
          user?.id == data.created_by.id || user?.permission?.includes(EDIT_DRAFT)
            ?
            <View>
              <ViewTabDropdown icon={<CreateIcon height={24} width={24} />} text="Edit Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/edit`); }} />
              <ViewTabDropdown icon={<TrashIcon height={24} width={24} />} text="Delete Quotation" setDropdown={path} navigation={() => { deleteQuotation(nav_id || "", user, () => { linkTo(`/quotations`); revalidateCollection(QUOTATIONS); refreshContext?.refreshList(QUOTATIONS); }, () => { }) }} />
            </View>
            :
            <></>
        }
      </View>
    )
  } else if (status == IN_REVIEW) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={24} width={24} />} text="Preview Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
        <ViewTabDropdown icon={<CreateIcon height={24} width={24} />} text="Edit Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/edit`); }} />
        <ViewTabDropdown icon={<DownloadIcon height={24} width={24} />} text="Download Quotation" setDropdown={path} navigation={() => { onDownload(data) }} />
      </View>
    )
  } else if (status == APPROVED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={24} width={24} />} text="Preview Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
        <ViewTabDropdown icon={<DownloadIcon height={24} width={24} />} text="Download Quotation" setDropdown={path} navigation={() => { onDownload(data) }} />
        <ViewTabDropdown icon={<ProceedIcon height={24} width={24} />} text="Proceed Sales Confirmation" setDropdown={path} navigation={() => { navigation.navigate("ProceedSalesConfirmation", { docID: nav_id }); }} />
        <ViewTabDropdown icon={<CreateIcon height={24} width={24} />} text="Edit Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/edit`); }} />
        <ViewTabDropdown icon={<FolderIcon height={24} width={24} />} text="Archive Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
      </View>
    )
  } else if (status == REJECTED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={24} width={24} />} text="Preview Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
        <ViewTabDropdown icon={<CreateIcon height={24} width={24} />} text="Edit Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/edit`); }} />
        <ViewTabDropdown icon={<FolderIcon height={24} width={24} />} text="Archive Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
      </View>
    )
  } else if (status == ARCHIVED) {
    dropdowns = (
      <View>
        <ViewTabDropdown icon={<PreviewIcon height={24} width={24} />} text="Preview Quotation" setDropdown={path} navigation={() => { linkTo(`/quotations/${nav_id}/show`); }} />
        <ViewTabDropdown icon={<DownloadIcon height={24} width={24} />} text="Download Quotation" setDropdown={path} navigation={() => { onDownload(data) }} />
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
          {
            status == CONFIRMED
              ?
              null
              :
              <View style={tailwind("flex-grow items-end pt-4")}>
                <ArrowDownIcon width={17} height={17} />
              </View>
          }
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

export default ViewTabQuotation;
import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { TickIcon } from '../../../../assets/svg/SVG';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { Receipt } from '../../../types/Receipt';
import LoadingData from '../../../components/atoms/loading/loadingData';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { View } from 'react-native';
import { useLinkTo } from '@react-navigation/native';
import { RECEIPTS } from '../../../constants/Firebase';
import { confirmReceipt } from '../../../services/ReceiptServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { REVISED_CODE } from '../../../types/Common';
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateOfficialReceiptPDF } from '../../../components/templates/pdf/generateOfficialReceiptPDF';
import { convertCurrency } from '../../../constants/Currency';

const CreateReceiptSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateReceiptSummary">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const linkTo = useLinkTo();
  const [modalOpen, setModalOpen] = useState(false);
  const user = useSelector(UserSelector);
  let displayID = "";
  let revisedCode;

  const { data } = useDocument<Receipt>(`${RECEIPTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    revalidateOnFocus: true,
  })

  if (!data) return <LoadingData message="This document might not exist" />;

  revisedCode = data.revised_code !== undefined ? Number(data.revised_code) + 1 : 0
  displayID = `${data.secondary_id}${data.revised_code !== undefined ? REVISED_CODE(revisedCode) : ""}`;

  const onDownload = async () => {
    let image = await loadPDFLogo();
    let html = generateOfficialReceiptPDF(data, image);
    await createAndDisplayPDF(html);
  }

  let modal = (
    <ConfirmModal
      text1={`Receipt "${displayID}" has been submitted`}
      downloadText='Download Official Receipt'
      horizontalButtons={false}
      image={<TickIcon height={100} width={100} />}
      button1Text="Done"
      visible={modalOpen}
      setModalClose={() => { setModalOpen(false) }}
      nextAction={() => {
        confirmReceipt(`${data.invoice_id}`, data.id, `${displayID}`, revisedCode, user!, () => { navigation.navigate("Dashboard"); revalidateCollection(RECEIPTS); }, (error) => { console.error(error); });
      }}
      cancelAction={() => { }}
      downloadButton={true}
      onDownload={onDownload}
    />
  );
  return (
    <Body header={<HeaderStack title={"Issue Receipt"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc="Official Receipt" id={displayID || ""} />

      {modal}

      <View>
        <InfoDisplay placeholder="Receipt Date" info={data.receipt_date} />
        <InfoDisplayLink placeholder="Invoice No." info={data.invoice_secondary_id} linkOnPress={() => { linkTo(`/invoices/${data.invoice_id}/preview`) }} />

        <InfoDisplay placeholder="Invoice Date" info={data.invoice_date} />
        <InfoDisplay placeholder="Account Received In" info={data.account_received_in?.name} />
        <InfoDisplay placeholder="Cheque Number" info={data.cheque_number || "-"} />
        <InfoDisplay placeholder="Received From" info={data.customer?.name || "-"} />
        <InfoDisplay placeholder="Customer Account No." info={data.customer?.account_no || "-"} />
        <InfoDisplay placeholder="Currency Rate" info={data.currency_rate || "-"} />
        {
          data.products.map((item, index) => (
            <View key={index}>
              <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
              <InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} />
              <InfoDisplay placeholder="BDN Quantity" info={`${addCommaNumber(item.BDN_quantity.quantity, "0")} ${item.BDN_quantity.unit}`} />
              <InfoDisplay placeholder="Unit of Measurement" info={`${addCommaNumber(item.quantity, "0")} ${item.unit}`} />
              <InfoDisplay placeholder="Price 1" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(item.price.value, "0")} ${item.price.unit}`} />
              <InfoDisplay placeholder="Subtotal" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(item.subtotal, "0")}`} />
            </View>
          ))
        }
        <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

        <InfoDisplay placeholder="Barging Fee" info={`${data.barging_fee ?`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
        <InfoDisplay placeholder="Discount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.discount, "-")}`} />
        <InfoDisplay placeholder="Total" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_payable, "-")}`} />
        <InfoDisplay placeholder="Amount Received" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.amount_received, "-")}`} />
      </View>



      <View style={tailwind("mt-10")} >
        <RegularButton text="Submit" operation={() => { setModalOpen(true) }} />
      </View>



    </Body >
  )
}

export default CreateReceiptSummaryScreen;
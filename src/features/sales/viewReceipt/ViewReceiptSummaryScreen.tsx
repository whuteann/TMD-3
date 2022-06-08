import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import {  useDocument } from '@nandorojo/swr-firestore';
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
import { createAndDisplayPDF, loadPDFLogo } from '../../../functions/PDFv2Functions';
import { generateOfficialReceiptPDF } from '../../../components/templates/pdf/generateOfficialReceiptPDF';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const ViewReceiptSummaryScreen = ({ navigation, route }: RootNavigationProps<"ViewReceiptSummary">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const linkTo = useLinkTo();

  const { data } = useDocument<Receipt>(`${RECEIPTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    revalidateOnFocus: true,
  })

  if (!data) return <LoadingData message="This document might not exist" />;

  const onDownload = async () => {
    let image = await loadPDFLogo();
    let html = generateOfficialReceiptPDF(data, image);
    console.log(data);
    await createAndDisplayPDF(html);
  }

  return (
    <Body header={<HeaderStack title={"Issue Receipt"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc="Official Receipt" id={data.display_id || ""} />

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
              <InfoDisplay placeholder="Price 1" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(item.price.value, "0")} ${item.price.unit}`} />
              <InfoDisplay placeholder="Subtotal" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(item.subtotal, "0")}`} />
            </View>
          ))
        }
        <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

        <InfoDisplay placeholder="Barging Fee" info={`${data.barging_fee ?`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
        <InfoDisplay placeholder="Discount" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.discount, "-")}`} />
        <InfoDisplay placeholder="Total" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.total_payable, "-")}`} />
        <InfoDisplay placeholder="Amount Received" info={`${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.amount_received, "-")}`} />
      </View>

      <View style={tailwind("mt-10")}>
        <View>
          <RegularButton text="Download" operation={() => { onDownload(); }} />
        </View>
        <RegularButton type="secondary" text="Edit" operation={() => { navigation.navigate("EditOfficialReceipt", { docID: docID }) }} />
      </View>
    </Body >
  )
}

export default ViewReceiptSummaryScreen;
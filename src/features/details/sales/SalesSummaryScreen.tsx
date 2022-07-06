import React from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { useDocument } from '@nandorojo/swr-firestore';
import { INVOICES, JOB_CONFIRMATIONS, QUOTATIONS, SALES, SALES_CONFIRMATIONS } from '../../../constants/Firebase';
import { Sales } from '../../../types/Sales';
import { Quotation } from '../../../types/Quotation';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { View } from 'react-native';
import ViewTabQuotation from '../../../components/templates/sales/ViewTabs/ViewTabQuotation';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { SalesConfirmation } from '../../../types/SalesConfirmation';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import { openDocument } from '../../../services/StorageServices';
import { JobConfirmation } from '../../../types/JobConfirmation';
import ViewTabJob from '../../../components/templates/sales/ViewTabs/ViewTabJob';
import { Invoice } from '../../../types/Invoice';
import ViewTabInvoice from '../../../components/templates/sales/ViewTabs/ViewTabInvoice';
import { ViewTabSalesConfirmation } from '../../sales/viewConfirmation/ViewAllSalesConfirmationScreen';


const SalesSummaryScreen = ({ navigation, route }: RootNavigationProps<"SalesSummary">) => {
  const docID: any = route.params?.docID;
  const tailwind = useTailwind();

  const { data: sales } = useDocument<Sales>(`${SALES}/${docID}`);
  const { data: quotation } = useDocument<Quotation>(`${QUOTATIONS}/${sales?.quotation_id}`);
  const { data: sales_confirmation } = useDocument<SalesConfirmation>(`${SALES_CONFIRMATIONS}/${sales?.sales_id}`);
  const { data: job_confirmation } = useDocument<JobConfirmation>(`${JOB_CONFIRMATIONS}/${sales?.job_id}`);
  const { data: invoice } = useDocument<Invoice>(`${INVOICES}/${sales?.invoice_id}`);

  if (!sales || !quotation || !sales_confirmation || !job_confirmation || !invoice) return <LoadingData />

  return (
    <Body header={<HeaderStack title={"Sales Summary"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <TextLabel content={`${quotation.customer?.name}`} style={tailwind("text-20px font-black")} />
      <View>
        <View style={tailwind("flex-row")}>
          <TextLabel content={`• ${quotation.customer?.contact_persons[0].name}`} style={tailwind("text-gray-primary")} />
        </View>
      </View>

      <View style={tailwind("mb-6")} />
      <InfoDisplay placeholder="Customer" info={quotation.customer?.name} />
      {
        sales_confirmation.port
          ?
          <View>
            <InfoDisplay placeholder={`Port`} info={sales_confirmation.port} />
            <InfoDisplay placeholder="Delivery Location" info={sales_confirmation.delivery_location} />
          </View>
          :
          <View>
            {
              quotation.ports.map((item, index) => {
                return (
                  <View key={item.port}>
                    <View style={tailwind("border border-neutral-300 mb-4 mt-2")} />
                    <InfoDisplay placeholder={`Port ${index + 1}`} info={item.port} />
                    <InfoDisplay placeholder="Delivery Location" info={item.delivery_location} />
                  </View>
                )
              })
            }
            <View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
          </View>
      }


      <InfoDisplay placeholder={`Delivery Date`} info={
        quotation.delivery_date?.startDate
          ?
          quotation.delivery_date.endDate
            ?
            `${quotation.delivery_date?.startDate} to ${quotation.delivery_date?.endDate}`
            :
            `${quotation.delivery_date.startDate}`
          :
          "-"}
      />
      {
        sales_confirmation.delivery_mode
          ?
          <InfoDisplay placeholder="Mode of Delivery" info={sales_confirmation.delivery_mode} />
          :
          quotation!.delivery_modes!.map((item, index) => {
            return (
              <View key={item}>
                <InfoDisplay placeholder={`Delivery Mode ${index + 1}`} info={`${item}` || "-"} bold={true} />
              </View>
            )
          })

      }

      <InfoDisplay placeholder="Currency Rate" info={quotation.currency_rate || "-"} />
      <View style={tailwind("mb-6")} />

      {
        quotation.id != "undefined"
          ?
          <ViewTabQuotation
            id={quotation.display_id}
            nav_id={quotation.id}
            org={quotation.customer?.name}
            name={quotation.customer?.contact_persons[0].name}
            status={quotation.status}
            navigation={navigation}
            date={quotation.quotation_date}
            data={quotation}
          />
          :
          null
      }
      {
        sales_confirmation.id != "undefined"
          ?
          <ViewTabSalesConfirmation
            item={sales_confirmation}
            navigation={navigation}
          />
          :
          null
      }
      {
        job_confirmation.id != "undefined"
          ?
          <ViewTabJob
            id={job_confirmation.secondary_id}
            nav_id={job_confirmation.id}
            org={job_confirmation.customer?.name}
            name={job_confirmation.customer?.contact_persons[0].name}
            date={job_confirmation.confirmed_date}
            status={job_confirmation.status}
            data={job_confirmation}
            navigation={navigation}
          />
          :
          null
      }
      {
        invoice.id != "undefined"
          ?
          <ViewTabInvoice
            id={invoice.id}
            display_id={invoice.display_id}
            org={invoice.customer_name}
            name={invoice.attention_pic?.name || invoice.customer?.contact_persons[0].name}
            date={invoice.invoice_date}
            status={invoice.status}
            navigation={navigation}
            data={invoice}
          />
          :
          null
      }
      <View style={tailwind("mb-6")} />
      {
        quotation.purchase_order_file
          ?
          <InfoDisplayLink placeholder="PO Attachment" info={quotation.purchase_order_file} linkOnPress={() => { openDocument(SALES_CONFIRMATIONS, quotation.filename_storage!) }} />
          :
          null
      }
      {
        job_confirmation.bdn_file
          ?
          <InfoDisplayLink placeholder="BDN Attachment" info={job_confirmation.bdn_file} linkOnPress={() => { openDocument(JOB_CONFIRMATIONS, job_confirmation.filename_storage_bdn!) }} />
          :
          null
      }
      {
        invoice.receipts
          ?
          invoice.receipts.map((item, index) => {
            if (invoice.receipts) {
              let navID = invoice.receipts[index].id;
              return (
                <InfoDisplayLink
                  key={index}
                  placeholder={`Official Receipt ${index + 1}`}
                  info={`${invoice.receipts[index].secondary_id}`}
                  linkOnPress={() => {
                    navigation.navigate("ViewReceiptSummary", { docID: navID });
                  }} />
              )
            }
          })
          :
          null
      }

    </Body>
  )
}

export default SalesSummaryScreen;
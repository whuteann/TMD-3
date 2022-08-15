import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { TickIcon } from '../../../../assets/svg/SVG';
import ConfirmModal from '../../../components/molecules/modal/ConfirmModal';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import { revalidateCollection, revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { updateInvoice } from '../../../services/InvoiceServices';
import { updateJobConfirmation } from '../../../services/JobConfirmationServices';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import { useTailwind } from 'tailwind-rn/dist';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { View } from 'react-native';
import { DRAFT, HEAD_OF_ACCOUNTS_ROLE, IN_REVIEW, ISSUED_INV, REJECTED, REVISED_CODE, SUPER_ADMIN_ROLE, UserRole } from '../../../types/Common';
import { UserSelector } from '../../../redux/reducers/Auth';
import { useSelector } from 'react-redux';
import { INVOICES, JOB_CONFIRMATIONS, LOGS } from '../../../constants/Firebase';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { SUBMIT_ACTION } from '../../../constants/Action';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';
import { sendNotifications } from '../../../services/NotificationServices';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { loadingDelay } from '../../../helpers/GenericHelper';
import { VIEW_JOB_CONFIRMATION } from '../../../permissions/Permissions';

const CreateInvoiceSummaryScreen = ({ navigation, route }: RootNavigationProps<"CreateInvoiceSummary">) => {

  const { docID } = route.params;
  const [modalOpen, setModalOpen] = useState(false);
  const tailwind = useTailwind();
  const allowedStatuses = [DRAFT, REJECTED];
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const user = useSelector(UserSelector);
  const refreshContext = useRefreshContext();

  let displayID = "";
  let revisedCode;

  const { data } = useDocument<Invoice>(`${INVOICES}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    revalidateOnFocus: true,
  })


  useEffect(() => {
    setRole(user?.role);
  }, [user])

  let bunkers = data?.bunker_barges;

  if (!data || !bunkers) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }


  revisedCode = data.revised_code == undefined || data.revised_code.toString() == "" ? 0 : Number(data.revised_code) + 1
  displayID = `${data.secondary_id}${data.revised_code == undefined || data.revised_code.toString() == "" ? "" : REVISED_CODE(revisedCode)}`;


  let modal = (
    <ConfirmModal
      text1={`Invoice "${displayID}" has been submitted`}
      text2=""
      button2Text=""
      horizontalButtons={false}
      image={<TickIcon height={100} width={100} />}
      button1Text="Done"
      downloadButton={false}
      visible={modalOpen}
      setModalClose={() => { setModalOpen(false) }}
      nextAction={() => {
        setLoading(true);

        updateInvoice(
          docID,
          { status: IN_REVIEW, revised_code: revisedCode, display_id: displayID },
          user!,
          SUBMIT_ACTION,
          () => {
            sendNotifications([HEAD_OF_ACCOUNTS_ROLE, SUPER_ADMIN_ROLE],
              revisedCode > 0
                ?
                `Invoice ${displayID} updated by ${user?.name}.`
                :
                `Invoice ${displayID} has been submitted for approval by ${user?.name}.`,
              { screen: "ViewInvoiceSummary", docID: data.id })

            updateJobConfirmation(
              data.job_confirmation_id,
              { status: ISSUED_INV, invoice_secondary_id: displayID, invoice_id: data.id, invoice_status: IN_REVIEW }, user!,
              () => {

                loadingDelay(() => {
                  user?.permission?.includes(VIEW_JOB_CONFIRMATION)
                    ?
                    navigation.navigate("ViewAllJobConfirmation")
                    :
                    navigation.navigate("Dashboard")

                  revalidateCollection(JOB_CONFIRMATIONS);
                  revalidateDocument(`${INVOICES}/${docID}`);
                  setLoading(false);
                });
              }, (error) => {
                console.error(error);
              }
            )
          }, (error) => {
            console.error(error);
          });

        refreshContext?.refreshList(INVOICES);
      }}
      cancelAction={() => {
        // navigation.navigate("Dashboard");
        // deleteInvoice(docID, () => { navigation.navigate("Dashboard") });
      }}
    />
  );

  return (
    <Body header={<HeaderStack title={"Create Invoice"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc="Invoice" id={displayID} />

      {modal}

      <View style={tailwind("mt-5 mb-7")}>

        <InfoDisplay placeholder="Invoice Date" info={data.invoice_date} />
        <InfoDisplay placeholder="D/O No." info={data.do_no} />
        <InfoDisplay placeholder="Purchase Order No." info={data.purchase_order_no || "-"} />
        <InfoDisplay placeholder="Payment Term" info={data.payment_term || "-"} />

        <View style={tailwind("border border-neutral-300 mb-5 mt-2")} />
        {
          bunkers.map((item, index) => {
            return (
              <View key={item.id}>

                <InfoDisplay placeholder={`Bunker Barge ${index + 1}`} info={`${item.name}` || "-"} bold={true} />
                <InfoDisplay placeholder={`Capacity`} info={`${addCommaNumber(item.capacity, "0")}` || "-"} />
              </View>
            )
          })
        }
        <View style={tailwind("border border-neutral-300 mb-5 mt-2")} />

        <View style={tailwind("mt-5")} />

        <InfoDisplay placeholder="Customer" info={data.customer?.name} />
        <InfoDisplay placeholder="Address" info={data.customer?.address} />
        <InfoDisplay placeholder="Attention (PIC)" info={data.attention_pic?.name || "-"} />
        <InfoDisplay placeholder="Phone" info={data.customer?.telephone} />
        <InfoDisplay placeholder="Fax" info={data.customer?.fax} />
        <InfoDisplay placeholder="Customer Account No." info={data.customer?.account_no} />

        <View style={tailwind("mt-5")} />

        <InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />

        {
          data.products.map((item, index) => (
            <View key={index}>
              <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
              <InfoDisplay placeholder={`Product ${index + 1}`} info={item.product.name} />
              <InfoDisplay placeholder="BDN Quantity" info={`${addCommaNumber(item.BDN_quantity.quantity, "0")} ${item.BDN_quantity.unit}`} />
              <InfoDisplay placeholder="Initial Ordered Quantity" info={`${addCommaNumber(item.quantity, "0")} ${item.unit}`} />
              <InfoDisplay
                placeholder="Price 1"
                info={`${convertCurrency(data.currency_rate!)}${addCommaNumber(item.price.value, "0")} per ${item.price.unit}`}
                secondLine={item.price.remarks ? item.price.remarks : undefined}
              />
              <InfoDisplay placeholder="Subtotal" info={`${convertCurrency(data.currency_rate!)}${addCommaNumber(item.subtotal, "0")}`} />
            </View>
          ))
        }

        <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

        <InfoDisplay placeholder="Barging Fee" info={`${data.barging_fee ? `${convertCurrency(data.currency_rate!)}${addCommaNumber(data.barging_fee, "-")}${data.barging_remark ? `/${data.barging_remark}` : ""}` : `-`}`} />
        <InfoDisplay placeholder={`Barging Unit`} info={`${data.barging_unit || "-"}`} />
        <InfoDisplay placeholder="Discount" info={`${convertCurrency(data.currency_rate!)}${addCommaNumber(data.discount, "-")}`} />
        <InfoDisplay placeholder="Total" info={`${convertCurrency(data.currency_rate!)}${addCommaNumber(data.total_payable, "-")}`} />

        <View style={tailwind("mt-5")} />

        <InfoDisplay placeholder="Sale Ref" info={data.quotation_secondary_id} />
        <InfoDisplay placeholder="Delivery Location" info={data.delivery_location || "-"} />

        <InfoDisplay placeholder={`Delivery Date`} info={
          data.delivery_date?.startDate
            ?
            data.delivery_date.endDate
              ?
              `${data.delivery_date?.startDate} to ${data.delivery_date?.endDate}`
              :
              `${data.delivery_date.startDate}`
            :
            "-"}
        />

        <InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode} />

        <View style={tailwind("mt-5")} />
        <InfoDisplay placeholder="Contract" info={data.contract || "-"} />
        <InfoDisplay placeholder="Bank Details" info={data.bank_details?.name} />
        <InfoDisplay placeholder="Notes" info={data.notes || "-"} />

      </View>

      <View style={tailwind("mt-7 mb-4")} >
        <RegularButton text="Submit Invoice" loading={loading} operation={() => { setModalOpen(true) }} />
      </View>

    </Body>
  )
}

export default CreateInvoiceSummaryScreen;
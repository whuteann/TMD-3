import React, { useEffect, useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import InfoDisplayLink from '../../../components/atoms/display/InfoDisplayLink';
import InfoDisplay from '../../../components/atoms/display/InfoDisplay';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { useTailwind } from 'tailwind-rn/dist';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { useDocument } from '@nandorojo/swr-firestore';
import { PurchaseOrder } from '../../../types/PurchaseOrder';
import { PURCHASE_ORDERS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { HEAD_OF_MARKETING_ROLE, MARKETING_EXECUTIVE_ROLE, UserRole } from '../../../types/Common';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { View } from 'react-native';
import { useLinkTo } from '@react-navigation/native';
import { addCommaNumber } from '../../../helpers/NumericHelper';
import { convertCurrency } from '../../../constants/Currency';

const PreviewPurchaseOrderScreen = ({ navigation, route }: RootNavigationProps<"ViewPurchaseOrderSummary">) => {

  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const user = useSelector(UserSelector);
  const linkTo = useLinkTo();
  const tailwind = useTailwind();
  const { docID } = route.params
  const [status, setStatus] = useState("");

  useEffect(() => {
    setRole(user?.role);
  }, [user])

  const { data } = useDocument<PurchaseOrder>(`${PURCHASE_ORDERS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    revalidateOnFocus: true,
  })

  useEffect(() => {
    setStatus(data?.status || "");
  }, [data?.status])

  if (!data) return <LoadingData message="This document might not exist" />;


  return (
    <Body header={<HeaderStack title={"View Purchase Order"} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Order" id={data.display_id} />

      <View>
        <InfoDisplay placeholder="Purchase Order Date" info={data.purchase_order_date} />
        <InfoDisplayLink placeholder="Procurement No." info={data.procurement_secondary_id} linkOnPress={() => { linkTo(`/procurements/${data.procurement_id}/preview`) }} />
        <InfoDisplay placeholder="Supplier" info={data.supplier.name} />
        <InfoDisplay placeholder="Product" info={data.product.name} />
        <InfoDisplay placeholder="Unit of Measurement" info={data.unit_of_measurement} />
        <InfoDisplay placeholder="Quantity" info={addCommaNumber(data.quantity, "-")} />
        <InfoDisplay placeholder="Unit Price" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.unit_price, "-")}`} />
        <InfoDisplay placeholder="Currency Rate" info={data.currency_rate} />
        <InfoDisplay placeholder="Total Amount" info={`${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_amount, "-")}`} />
        <InfoDisplay placeholder="Payment Term" info={data.payment_term} />
        <InfoDisplay placeholder="Vessel Name" info={data.vessel_name ? data.vessel_name.name : "-"} />

        <InfoDisplay placeholder="Mode of Delivery" info={data.delivery_mode} />
        <InfoDisplay placeholder={data.delivery_mode_type} info={data.delivery_mode_details || "-"} />
        <InfoDisplay placeholder="Port" info={data.port} />
        <InfoDisplay placeholder="Delivery Location" info={data.delivery_location} />
        <InfoDisplay placeholder="Contact Person" info={data.contact_person.name} />

        <InfoDisplay placeholder={`ETA/ Delivery Date`} info={
          data.ETA_delivery_date?.startDate
            ?
            data.ETA_delivery_date.endDate
              ?
              `${data.ETA_delivery_date?.startDate} to ${data.ETA_delivery_date?.endDate}`
              :
              `${data.ETA_delivery_date.startDate}`
            :
            "-"}
        />

        <InfoDisplay placeholder="Remarks" info={data.remarks || "-"} />
        {
          data.purchase_vouchers
            ?
            <View>
              {
                data.purchase_vouchers.map((item, index) => {
                  return <InfoDisplayLink placeholder={`Purchase Voucher ${index + 1}`} info={item.secondary_id} linkOnPress={() => { navigation.navigate("ViewPurchaseVoucherSummary", { docID: item.id }) }} />
                })
              }
            </View>
            :
            null
        }
        {
          status == "Rejected"
            ?
            <InfoDisplay placeholder="Reject notes" info={data.reject_notes || "-"} />
            :
            null
        }
        {
          (data.status == "No Purchase Voucher" || data.status == "PV issued") && (role == MARKETING_EXECUTIVE_ROLE || role == HEAD_OF_MARKETING_ROLE)
            ?
            <InfoDisplay placeholder="Operation status" info={data.status} bold={true} />
            :
            null
        }
      </View>

    </Body>
  )
}

export default PreviewPurchaseOrderScreen;
import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { BANKS, SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import { View } from 'react-native';
import * as Yup from 'yup';
import { Bank } from '../../../types/Bank';
import { getBankNameList } from '../../../helpers/BankHelper';
import { APPROVED_DOC, DRAFT, PURCHASE_VOUCHER_CODE, PV_ISSUED, PV_PENDING, SPARES_PURCHASE_ORDER_CODE } from '../../../types/Common';
import { SparesPurchaseOrder } from '../../../types/SparesPurchaseOrder';
import { createSparesPurchaseVoucher } from '../../../services/SparesPurchaseVoucherServices';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { updateSparesPurchaseOrder } from '../../../services/SparesPurchaseOrderServices';
import { UPDATE_ACTION } from '../../../constants/Action';


const to_replace_string = SPARES_PURCHASE_ORDER_CODE;
const replace_string = PURCHASE_VOUCHER_CODE;


const formSchema = Yup.object().shape({
  // account_purchase_by: Yup.string().required("Required"),
  // cheque_no: Yup.string().required("Required"),
  // paid_amount: Yup.string().required("Required")
});

const currentDate = `${new Date().getDate().toString()}/${+new Date().getMonth().toString() + 1}/${new Date().getFullYear().toString()}`

const CreateSparesPurchaseVoucherFormScreen = ({ navigation, route }: RootNavigationProps<"CreateSparesPurchaseVoucherForm">) => {
  const tailwind = useTailwind();
  const [loading, setLoading] = useState(false);
  const { docID } = route.params;
  let displayID: string = "";
  const user = useSelector(UserSelector);
  const allowedStatuses = [APPROVED_DOC, PV_ISSUED, PV_PENDING];

  type initialValuesType = {
    purchase_voucher_date: string,
    account_purchase_by: string,
    cheque_no: string,
    paid_amount: string,
  };

  const { data } = useDocument<SparesPurchaseOrder>(`${SPARES_PURCHASE_ORDERS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: banks } = useCollection<Bank>(`${BANKS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !banks) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  const { bankList } = getBankNameList(banks);

  displayID = `${data.secondary_id.replace(to_replace_string, replace_string)}`;

  let initialValues: initialValuesType = {
    purchase_voucher_date: currentDate,
    account_purchase_by: "",
    cheque_no: "",
    paid_amount: ""
  };

  let poData = {
    doNumber: data.doNumber,
    invNumber: data.invNumber,
    spares_purchase_order_id: data.id,
    spares_purchase_order_secondary_id: data.display_id,
    original_amount: data.total_amount,
    supplier: data.supplier,
    product: data.product,
    unit_of_measurement: data.unit_of_measurement,
    quantity: data.quantity,
    currency_rate: data.currency_rate,
    unit_price: data.unit_price,
    payment_term: data.payment_term,
    vessel_name: data.vessel_name,
    type_of_supply: data.type_of_supply,
    delivery_location: data.delivery_location,
    contact_person: data.contact_person,
    ETA_delivery_date: data.ETA_delivery_date,
    remarks: data.remarks,
  }


  return (
    <Body header={<HeaderStack title={`Create Purchase Voucher`} navigateProp={navigation} />} style={tailwind("mt-6")}>

      {/* <ViewPageHeaderText doc="Purchase Voucher" id={displayID} /> */}

      <Formik
        initialValues={initialValues}
        onSubmit={
          (values) => {
            setLoading(true);
            let bank_chosen;
            let bank_details;
            if (values.account_purchase_by) {
              bank_chosen = banks[bankList.indexOf(values.account_purchase_by || "")]
              bank_details = {
                id: bank_chosen.id,
                name: bank_chosen.name,
                account_no: bank_chosen.account_no,
                swift_code: bank_chosen.swift_code,
                address: bank_chosen.address,
              }
            } else {
              bank_details = ""
            }

            createSparesPurchaseVoucher({ ...values, secondary_id: displayID, ...poData, status: DRAFT, account_purchase_by: bank_details, display_id: displayID }, user!, (id) => {
              navigation.navigate("CreateSparesPurchaseVoucherSummary", { docID: id });
              setLoading(false);
            }, (error) => {
              setLoading(false);
              console.error(error);
            })
          }
        }
        validationSchema={formSchema}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View>

            <FormTextInputField
              label="Purchase Voucher Date"
              value={values.purchase_voucher_date}
              editable={false}
            />

            <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />

            <FormTextInputField
              label="Delivery Note No."
              value={poData.doNumber}
              editable={false}
            />

            <FormTextInputField
              label="Invoice No."
              value={poData.invNumber}
              editable={false}
            />

            <FormTextInputField
              label="Purchase Order No."
              editable={false}
              value={poData.spares_purchase_order_secondary_id}
            />

            <FormTextInputField
              label="Original Amount"
              editable={false}
              value={poData.original_amount}
            />


            <FormDropdownInputField
              label="Account Purchase by"
              value={values.account_purchase_by}
              items={bankList}
              onChangeValue={(val) => { setFieldValue("account_purchase_by", val) }}
              hasError={errors.account_purchase_by && touched.account_purchase_by ? true : false}
              errorMessage={errors.account_purchase_by}
            />

            <FormTextInputField
              label="Cheque No."
              value={values.cheque_no}
              onChangeValue={text => setFieldValue("cheque_no", text)}
              hasError={errors.cheque_no && touched.cheque_no ? true : false}
              errorMessage={errors.cheque_no}
            />

            <FormTextInputField
              label="Paid Amount"
              number={true}
              value={values.paid_amount}
              onChangeValue={text => setFieldValue("paid_amount", text)}
              hasError={errors.paid_amount && touched.paid_amount ? true : false}
              errorMessage={errors.paid_amount}
            />

            <RegularButton text="Review PV & Submit" operation={() => { handleSubmit() }} loading={loading} />

          </View>
        )}
      </Formik>
    </Body>
  )
}

export default CreateSparesPurchaseVoucherFormScreen;
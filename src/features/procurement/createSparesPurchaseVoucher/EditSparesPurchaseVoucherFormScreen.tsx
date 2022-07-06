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
import { revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { BANKS, SPARES_PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import { View } from 'react-native';
import * as Yup from 'yup';
import { Bank } from '../../../types/Bank';
import { getBankNameList } from '../../../helpers/BankHelper';
import { DRAFT, PURCHASE_VOUCHER_CODE, REJECTED, SPARES_PURCHASE_ORDER_CODE } from '../../../types/Common';
import { SparesPurchaseVoucher } from '../../../types/SparesPurchaseVoucher';
import { updateSparesPurchaseVoucher } from '../../../services/SparesPurchaseVoucherServices';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';


const to_replace_string = SPARES_PURCHASE_ORDER_CODE;
const replace_string = PURCHASE_VOUCHER_CODE;


const formSchema = Yup.object().shape({
  // account_purchase_by: Yup.string().required("Required"),
  // cheque_no: Yup.string().required("Required"),
  // paid_amount: Yup.string().required("Required")
});


const EditSparesPurchaseVoucherFormScreen = ({ navigation, route }: RootNavigationProps<"EditSparesPurchaseVoucherForm">) => {
  const tailwind = useTailwind();
  const [loading, setLoading] = useState(false);
  const { docID } = route.params;
  let displayID: string = "";
  const allowedStatuses = [DRAFT, REJECTED];
  const user = useSelector(UserSelector);

  type initialValuesType = {
    purchase_voucher_date: string,
    account_purchase_by: string,
    cheque_no: string,
    paid_amount: string,
    reject_notes: string,
  };

  const { data } = useDocument<SparesPurchaseVoucher>(`${SPARES_PURCHASE_VOUCHERS}/${docID}`, {
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
    purchase_voucher_date: data.purchase_voucher_date || "",
    account_purchase_by: data.account_purchase_by.name || "",
    cheque_no: data.cheque_no || "",
    paid_amount: data.paid_amount || "",
    reject_notes: " "

  };



  return (
    <Body header={<HeaderStack title={`Edit Purchase Voucher`} navigateProp={navigation} />} style={tailwind("mt-6")}>

      <ViewPageHeaderText doc="Purchase Voucher" id={displayID} />

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
            }else{
              bank_details = ""
            }

            updateSparesPurchaseVoucher(docID, { ...values, status: DRAFT, account_purchase_by: bank_details, created_by: user }, user!, UPDATE_ACTION, () => {
              revalidateDocument(`${SPARES_PURCHASE_VOUCHERS}/${docID}`)
              navigation.navigate("CreateSparesPurchaseVoucherSummary", { docID: docID });
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
              value={data.doNumber}
              editable={false}
            />

            <FormTextInputField
              label="Invoice No."
              value={data.invNumber}
              editable={false}
            />

            <FormTextInputField
              label="Purchase Order No."
              editable={false}
              value={data.spares_purchase_order_secondary_id}
            />

            <FormTextInputField
              label="Original Amount"
              editable={false}
              value={data.original_amount}
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

export default EditSparesPurchaseVoucherFormScreen;
import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import DoubleDisplay from '../../../components/molecules/display/DoubleDisplay';
import { Formik } from 'formik';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { Receipt } from '../../../types/Receipt';
import { updateReceipt } from '../../../services/ReceiptServices';
import { useLinkTo } from '@react-navigation/native';
import { useTailwind } from 'tailwind-rn';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { View } from 'react-native';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import TextInputField from '../../../components/atoms/input/text/TextInputField';
import * as Yup from "yup";
import { Bank } from '../../../types/Bank';
import { BANKS,  RECEIPTS } from '../../../constants/Firebase';
import { getBankNameList } from '../../../helpers/BankHelper';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { convertCurrency } from '../../../constants/Currency';


const formSchema = Yup.object().shape({
  amount_received: Yup.string().required("Required"),
  account_received_in: Yup.string().required("Required")
});

const EditReceiptFormScreen = ({ navigation, route }: RootNavigationProps<"EditOfficialReceipt">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const linkTo = useLinkTo();
  const user = useSelector(UserSelector);

  let receiptID: string = "";
  let initialValues = {
    secondary_id: "",
    invoice_id: "",
    invoice_secondary_id: "",
    account_received_in: "",
    cheque_number: "",
    customer: { name: "", account_no: "" },
    receipt_date: "",
    barging_fee: "",
    invoice_date: "",
    products: [{ product: { name: "" }, BDN_quantity: { quantity: "", unit: "" }, quantity: "", unit: "", price: { value: "", unit: "" }, subtotal: "" }],
    discount: "",
    total_payable: "",
    amount_received: "",
  };

  const { data } = useDocument<Receipt>(`${RECEIPTS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: banks } = useCollection<Bank>(`${BANKS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  })

  if (!data || !banks) return <LoadingData message="This document might not exist" />;

  const { bankList } = getBankNameList(banks);
  receiptID = data.secondary_id || "";

  initialValues = {
    customer: data.customer || { name: "", account_no: "" },
    secondary_id: data.secondary_id || "",
    invoice_id: data.invoice_id || "",
    cheque_number: data.cheque_number || "",
    receipt_date: data.receipt_date,
    barging_fee: data.barging_fee || "",
    invoice_date: data.invoice_date,
    invoice_secondary_id: data.invoice_secondary_id,
    products: data.products,
    account_received_in: data.account_received_in?.name || "",
    discount: data.discount || "",
    total_payable: data.total_payable || "",
    amount_received: data.amount_received || "",
  }

  return (
    <Body header={<HeaderStack title={"Issue Receipt"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc="Official Receipt" id={receiptID} />

      <Formik
        initialValues={initialValues}
        validationSchema={formSchema}
        onSubmit={(values) => {
          setLoading(true);
          let bank_chosen = banks[bankList.indexOf(values.account_received_in || "")]

          updateReceipt(docID,
            {
              ...values,
              account_received_in: {
                id: bank_chosen.id,
                name: bank_chosen.name,
                account_no: bank_chosen.account_no,
                swift_code: bank_chosen.swift_code,
                address: bank_chosen.address,
              }
            },
            user!,
            UPDATE_ACTION,
            () => { linkTo(`/receipts/${docID}/summary`); setLoading(false); },
            (error) => { console.error(error); });
        }}
      >

        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind("mt-5")}>

            <FormTextInputField
              label="Receipt Date"
              value={values.receipt_date}
              editable={false}
            />

            <FormTextInputField
              label="Invoice Number"
              value={values.invoice_secondary_id}
              editable={false}
            />

            <FormDropdownInputField
              label="Account Received In"
              value={values.account_received_in || ""}
              items={bankList}
              onChangeValue={(val) => setFieldValue("account_received_in", val)}
              hasError={errors.account_received_in && touched.account_received_in ? true : false}
              errorMessage={errors.account_received_in}
              required={true}
            />

            <FormTextInputField
              label="Cheque Number"
              value={values.cheque_number || ""}
              onChangeValue={(val) => setFieldValue("cheque_number", val)}
            />

            <FormTextInputField
              label="Received From"
              value={values.customer?.name || "-"}
              editable={false}
            />

            <FormTextInputField
              label="Customer Account No. (e.g 3000-C012)"
              value={values.customer?.account_no || "-"}
              editable={false}
            />

            {
              values.products.map((item, index) => (
                <View key={index}>
                  <View style={tailwind("mb-1")}>
                    <TextLabel content={`Product ${index + 1} - ${item.product.name}`} />
                  </View>

                  <DoubleDisplay label={`BDN Quantity ${index + 1}`} amount={item.BDN_quantity.quantity} unit={item.BDN_quantity.unit} />

                  <DoubleDisplay label={`Unit of Measurement ${index + 1}`} amount={item.quantity} unit={item.unit} />

                  <DoubleDisplay label={`Price ${index + 1}`} amount={`${convertCurrency(data.currency_rate!)} ${item.price.value}`} unit={item.price.unit} />

                  <View style={tailwind("mb-4")}>
                    <View style={tailwind("mb-2")}>
                      <TextLabel content="Subtotal" color='font-black text-gray-primary' />
                    </View>
                    <TextInputField
                      placeholder={`${convertCurrency(data.currency_rate!)} ${item.subtotal}`}
                      onChangeText={() => null}
                      editable={false}
                      shadow={true}
                    />
                  </View>
                </View>
              ))
            }

            <FormTextInputField
              label="Barging Fee"
              value={`${convertCurrency(data.currency_rate!)} ${values.barging_fee || "0"}`}
              editable={false}
            />

            <FormTextInputField
              label="Discount"
              value={`${convertCurrency(data.currency_rate!)} ${values.discount}`}
              editable={false}
            />

            <FormTextInputField
              label="Total"
              value={`${convertCurrency(data.currency_rate!)} ${values.total_payable}`}
              editable={false}
            />

            <FormTextInputField
              label="Amount Received"
              value={`${convertCurrency(data.currency_rate!)} ${values.amount_received}`}
              onChangeValue={text => setFieldValue("amount_received", text.replace(`${convertCurrency(data.currency_rate!)}`, "").trim())}
              required={true}
              number={true}
              hasError={errors.amount_received && touched.amount_received ? true : false}
              errorMessage={errors.amount_received}
            />

            <RegularButton text="Review Receipt and Submit" operation={() => { handleSubmit() }} loading={loading} />

          </View>
        )}
      </Formik>
    </Body>
  )
}

export default EditReceiptFormScreen;
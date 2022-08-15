import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import ProductSection from '../../../components/templates/sales/CreateInvoice/ProductSection';
import { FieldArray, Formik } from 'formik';
import { revalidateDocument, useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { updateInvoice } from '../../../services/InvoiceServices';
import { useLinkTo } from '@react-navigation/native';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import { useTailwind } from 'tailwind-rn';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import Body from '../../../components/atoms/display/Body';
import { View } from 'react-native';
import * as Yup from "yup";
import { BANKS, INVOICES } from '../../../constants/Firebase';
import { Product } from '../../../types/Product';
import { Bank } from '../../../types/Bank';
import { getBankNameList } from '../../../helpers/BankHelper';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { DRAFT, REJECTED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { convertCurrency } from '../../../constants/Currency';

type InitialValues = {
  products: Array<{ product: Product, BDN_quantity: { quantity: string, unit: string }, quantity: string, unit: string, price: { value: string, unit: string, remarks: string }, subtotal: string }>,
  contract: string,
  discount: string,
  notes: string | "",
  bank_details: string | undefined,
  total_payable: string,
  barging_fee: string,
  total_before_discount?: string,
}


const formSchema = Yup.object().shape({
  products: Yup.array().of(
    Yup.object().shape({
      BDN_quantity: Yup.object().shape({
        quantity: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
        unit: Yup.string().required("Required")
      }),
      unit: Yup.string(),
      subtotal: Yup.string(),
      price: Yup.object().shape({
        value: Yup.string().required("Required").matches(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/, "Please ensure the correct number format"),
        unit: Yup.string().required("Required")
      })
    })
  ),

  bank_details: Yup.string().required("Required"),
});

const CreateInvoiceFormScreen2 = ({ navigation, route }: RootNavigationProps<"CreateInvoice2">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const linkTo = useLinkTo();
  const allowedStatuses = [DRAFT, REJECTED];
  const user = useSelector(UserSelector);

  const { data } = useDocument<Invoice>(`${INVOICES}/${docID}`, {
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

  const initialValues: InitialValues = {
    contract: data.contract || "",
    products: data.products || {},
    discount: data.discount || "",
    notes: data.notes || ``,
    barging_fee: data.barging_fee || "",
    bank_details: data.bank_details?.name || "Select",
    total_payable: "0",
    total_before_discount: "0"
  }

  const invoice = {
    secondary_id: data.secondary_id,
    display_id: data.display_id,
    invoice_date: data.invoice_date,
    do_no: data.do_no,
    purchase_order_no: data.purchase_order_no,
    payment_term: data.payment_term,
    bunker_barges: data.bunker_barges,

    customer_name: data.customer_name,
    customer: data.customer,
    attention_pic: data.attention_pic,

    currency_rate: data.currency_rate,
    products: data.products,

    quotation_secondary_id: data.quotation_secondary_id,
    delivery_location: data.delivery_location,
    delivery_date: data.delivery_date,
    delivery_mode: data.delivery_mode,

    job_confirmation_id: data.job_confirmation_id,
    status: DRAFT,
    discount: "",
    total_payable: "0",
  }

  return (
    <Body header={<HeaderStack title={"Create Invoice"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc="Invoice" id={data.secondary_id} />

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={formSchema}
        onSubmit={(values) => {
          delete values['total_before_discount'];
          setLoading(true);

          let bank_chosen = banks[bankList.indexOf(values.bank_details || "")]
          if (invoice.discount == "") {
            invoice.discount = "0.00";
          }
          values.total_payable = `${Number(values.total_payable) + Number(values.barging_fee)}`
          updateInvoice(
            docID,
            {
              ...invoice,
              ...values,
              bank_details: {
                id: bank_chosen.id,
                name: bank_chosen.name,
                account_no: bank_chosen.account_no,
                swift_code: bank_chosen.swift_code,
                address: bank_chosen.address,
              }
            },
            user,
            UPDATE_ACTION,
            () => {
              linkTo(`/invoices/${docID}/summary`);
              setLoading(false);
              revalidateDocument(`${INVOICES}/${docID}`);
            }, (error) => {
              console.error(error);
            });
        }}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind("mt-5")}>

            <FormTextInputField label="Currency Rate" value={data.currency_rate || ""} editable={false} />

            <FieldArray name="products">
              {() => (
                <View>
                  {values.products.length > 0 ? (
                    values.products.map((product, index) => (
                      <ProductSection
                        key={index}
                        index={index}
                        currency={convertCurrency(data.currency_rate!)}
                        HandleChange={(val) => { setFieldValue(`total_before_discount`, val); setFieldValue(`total_payable`, ((Number(val) - Number(values.discount)).toFixed(2)).toString()); }}
                        products={values.products}
                        errors={touched.products && errors.products ? errors.products[index] : undefined}
                      />
                    ))) : null}
                </View>
              )}
            </FieldArray>

            <FormTextInputField
              label="Barging Fee"
              value={`${convertCurrency(data.currency_rate!)} ${values.barging_fee || 0}`}
              editable={false}
            />

            <FormTextInputField
              label="Discount"
              value={`${convertCurrency(data.currency_rate!)} ${values.discount}`}
              placeholder='RM0.00'
              onChangeValue={
                (val) => {
                  setFieldValue(`discount`, val.replace(`${convertCurrency(data.currency_rate!)}`, '').trim());
                  setFieldValue("total_payable", (Number(values.total_before_discount) - Number(val.replace(`${convertCurrency(data.currency_rate!)}`, '').trim())).toString());
                }
              }
              number={true}
            />


            <FormTextInputField
              label="Total Payable"
              value={`${convertCurrency(data.currency_rate!)} ${Number(values.total_payable) + Number(values.barging_fee)}`}
              editable={false}
            />

            <FormDropdownInputField
              label="Bank Details"
              value={values.bank_details || ""}
              items={bankList}
              required={true}
              onChangeValue={(val) => { setFieldValue(`bank_details`, val); }}
              hasError={errors.bank_details && touched.bank_details ? true : false}
              errorMessage={errors.bank_details}
            />

            <FormTextInputField
              label="Contract"
              value={values.contract}
              onChangeValue={text => setFieldValue("contract", text)}
              hasError={errors.contract && touched.contract ? true : false}
              errorMessage={errors.contract}
            />

            <FormTextInputField
              label="Notes"
              value={values.notes || ""}
              onChangeValue={(val) => { setFieldValue(`notes`, val); }}
              multiline={true}
            />
            <RegularButton text="Next" operation={() => { handleSubmit() }} loading={loading} />

          </View>
        )}

      </Formik>

    </Body>
  )
}

export default CreateInvoiceFormScreen2;
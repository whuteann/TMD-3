import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { createInvoice } from '../../../services/InvoiceServices';
import { useLinkTo } from '@react-navigation/native';
import { contactPerson, Customer } from '../../../types/Customer';
import { JobConfirmation } from '../../../types/JobConfirmation';
import { useTailwind } from 'tailwind-rn';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { View } from 'react-native';
import * as Yup from "yup";
import { Product } from '../../../types/Product';
import { CUSTOMERS, JOB_CONFIRMATIONS } from '../../../constants/Firebase';
import { DRAFT, ISSUED_INV, NO_INVOICE } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { LITRES } from '../../../constants/Units';
import { User } from '../../../types/User';
import { updateJobConfirmation } from '../../../services/JobConfirmationServices';
import { updateSales } from '../../../services/SalesServices';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';
import { CustomerSegmentation } from '../../../types/CustomerSegmentation';

const formSchema = Yup.object().shape({
  do_no: Yup.string().required("Required"),
  invoice_date: Yup.string().required("Required"),
});

const currentDate = `${new Date().getDate().toString()}/${+new Date().getMonth().toString() + 1}/${new Date().getFullYear().toString()}`

const CreateInvoiceFormScreen = ({ navigation, route }: RootNavigationProps<"CreateInvoice">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const allowedStatuses = [NO_INVOICE];
  const user = useSelector(UserSelector);
  const linkTo = useLinkTo();
  let customer: Customer | undefined;
  let attentionPICList: Array<string> = [];
  let initialValues: Invoice | undefined = undefined;

  const { data } = useDocument<JobConfirmation>(`${JOB_CONFIRMATIONS}/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: customerData } = useDocument<Customer>(`${CUSTOMERS}/${data?.customer?.id}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })


  if (!data || !customerData) return <LoadingData message="This document might not exist" />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  let invProducts: Array<{ product: Product, BDN_quantity: { quantity: string, unit: string }, quantity: string, unit: string, price: { value: string, unit: string }, subtotal: string }> = [];
  data.products.map((item) => { invProducts.push({ product: item.product, BDN_quantity: { quantity: "", unit: LITRES }, quantity: item.quantity, unit: item.unit, price: item.price, subtotal: "" }) })

  initialValues = {
    secondary_id: "",
    display_id: "",
    invoice_date: "",
    purchase_order_no: data.purchase_order_no,
    payment_term: data.payment_term,
    bunker_barges: data.bunker_barges,
    barging_fee: data.barging_fee,
    barging_remark: data.barging_remark,
    customer: data.customer || {} as Customer,
    customer_name: data.customer?.name || "",
    currency_rate: data.currency_rate,
    products: invProducts,
    sales_id: data.sales_id,

    quotation_secondary_id: data.quotation_secondary_id,
    delivery_location: data.delivery_location,
    delivery_date: data.delivery_date,
    delivery_mode: data.delivery_mode,
    job_confirmation_secondary_id: data.secondary_id,
    receiving_vessel_name: data.receiving_vessel_name || "",
    sales_confirmation_secondary_id: data.sales_confirmation_secondary_id,
    job_confirmation_id: data.id,
    status: DRAFT,
    created_by: {} as User,
  };

  customer = customerData

  customerData.contact_persons.map(
    (item) => {
      attentionPICList.push(item.name)
    }
  )


  return (
    <Body header={<HeaderStack title={"Create Invoice"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <View style={tailwind("mt-5")} />

      <Formik
        initialValues={{ invoice_date: "", do_no: "", attention_pic: "" }}
        enableReinitialize={true}
        validationSchema={formSchema}
        onSubmit={(values) => {
          console.log(values);

          let customer_info: Customer = {
            secondary_id: customer?.secondary_id || "",
            credit_limit: customer?.credit_limit || "",
            name: customer?.name || "",
            address: customer?.address || "",
            contact_persons: customer?.contact_persons || [],
            fax: customer?.fax || "",
            telephone: customer?.telephone || "",
            id: customer?.id || "",
            account_no: customer?.account_no || "",
            segmentation: customer?.segmentation || {} as CustomerSegmentation,
            status: customer?.status || "Active",
            created_at: customer?.created_at || "",
            remarks: customer?.remarks || ""
          }

          let attention_pic_info: contactPerson = customer_info.contact_persons[attentionPICList.indexOf(values.attention_pic)] || { name: "", email: "", phone_number: "" };

          console.log({ ...values, customer: customer_info, ...initialValues, attention_pic: attention_pic_info });

          setLoading(true);

          createInvoice(
            `${initialValues?.job_confirmation_secondary_id}`,
            {  customer: customer_info, ...initialValues, ...values,  attention_pic: attention_pic_info },
            user!, (newID, displayID) => {
              updateJobConfirmation(
                data.id,
                { status: ISSUED_INV, invoice_secondary_id: displayID, invoice_id: newID, invoice_status: DRAFT }, user!,
                () => {
                  updateSales(
                    data.sales_id,
                    { invoice_id: newID },
                    user,
                    () => {
                      linkTo(`/invoices/${newID}/edit/cont`);
                      setLoading(false);
                    }, (error) => {
                      console.log(error);
                    }
                  )
                }, (error) => {
                  console.log(error);
                }
              );
            }, (error) => {
              console.log(error);
            })
        }}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View>

            <FormDateInputField
              label="Invoice Date"
              value={values.invoice_date}
              onChangeValue={text => setFieldValue("invoice_date", text)}
              hasError={errors.invoice_date && touched.invoice_date ? true : false}
              errorMessage={errors.invoice_date}
            />

            <FormTextInputField
              label="D/O No."
              value={values.do_no || ""}
              placeholder='e.g. BDN-TM7291'
              onChangeValue={(val) => { setFieldValue("do_no", val) }}
              required={true}
              hasError={errors.do_no && touched.do_no ? true : false}
              errorMessage={errors.do_no}
            />

            <FormTextInputField
              label="Purchase Order No."
              value={initialValues?.purchase_order_no || "-"}
              editable={false}
            />

            <FormTextInputField
              label="Customer"
              value={initialValues?.customer_name || ""}
              editable={false}
            />

            <FormTextInputField
              label="Address"
              value={customer?.address || ""}
              editable={false}
              multiline={true}
            />

            <FormDropdownInputField
              label="ATTENTION (PIC)"
              value={values.attention_pic || "-- Select -- "}
              items={attentionPICList}
              onChangeValue={(val) => { setFieldValue("attention_pic", val) }}
              required={false}
              shadow={true}
            />

            <FormTextInputField
              label="Telephone"
              value={customer?.telephone || ""}
              editable={false}
            />

            <FormTextInputField
              label="Fax"
              value={customer?.fax || ""}
              editable={false}
            />

            <FormTextInputField
              label="Customer Account No (e.g. 3000-C012)"
              value={customer?.account_no || ""}
              editable={false}
            />

            <RegularButton text="Next" operation={() => { handleSubmit(); }} loading={loading} />

          </View>
        )}
      </Formik>

    </Body>
  )
}

export default CreateInvoiceFormScreen;
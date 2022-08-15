import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import { Formik } from 'formik';
import { useDocument } from '@nandorojo/swr-firestore';
import { Invoice } from '../../../types/Invoice';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { updateInvoice } from '../../../services/InvoiceServices';
import { useLinkTo } from '@react-navigation/native';
import { contactPerson, Customer } from '../../../types/Customer';
import { useTailwind } from 'tailwind-rn';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import { View } from 'react-native';
import * as Yup from "yup";
import { DRAFT, REJECTED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { UPDATE_ACTION } from '../../../constants/Action';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { updateJobConfirmation } from '../../../services/JobConfirmationServices';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';
import { CUSTOMERS } from '../../../constants/Firebase';

const formSchema = Yup.object().shape({
  do_no: Yup.string().required("Required"),
  invoice_date: Yup.string().required("Required"),
});

const EditInvoiceFormScreen = ({ navigation, route }: RootNavigationProps<"EditInvoice">) => {
  const tailwind = useTailwind();
  const { docID } = route.params;
  const [loading, setLoading] = useState(false);
  const allowedStatuses = [DRAFT, REJECTED];
  const user = useSelector(UserSelector);
  const linkTo = useLinkTo();
  let customer: Customer | undefined;
  let attentionPICList: Array<string> = [];
  let initialValues: Invoice  = {} as Invoice;

  const { data } = useDocument<Invoice>(`invoices/${docID}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  const { data: customerData } = useDocument<Customer>(`${CUSTOMERS}/${data?.customer?.id}`, {
    ignoreFirestoreDocumentSnapshotField: false,
  })

  if (!data || !customerData) return <LoadingData message="This document might not exist " />;

  if (!allowedStatuses.includes(data?.status!)) {
    return <Unauthorized />;
  }

  initialValues = {
    invoice_date: data.invoice_date,
    secondary_id: data.secondary_id,
    revised_code: data.revised_code,
    display_id: data.display_id,
    products: data.products,
    do_no: data.do_no,
    attention_pic: data.attention_pic,
    purchase_order_no: data.purchase_order_no,
    customer_name: data.customer_name,
    customer: data.customer,
    sales_id: data.sales_id,
    receiving_vessel_name: data.receiving_vessel_name,
    sales_confirmation_secondary_id: data.sales_confirmation_secondary_id,
    created_by: user!
  };

  customerData.contact_persons.map(
    (item) => {
      attentionPICList.push(item.name)
    }
  )

  return (
    <Body header={<HeaderStack title={"Create Invoice"} navigateProp={navigation} />} style={tailwind("pt-10")}>

      <ViewPageHeaderText doc='Invoice' id={`${initialValues?.display_id}`} />

      <Formik
        initialValues={{ do_no: initialValues?.do_no || "", attention_pic: initialValues?.attention_pic?.name || "", invoice_date: initialValues.invoice_date }}
        enableReinitialize={true}
        validationSchema={formSchema}
        onSubmit={(values) => {

          let attention_pic_info: contactPerson = customerData.contact_persons[attentionPICList.indexOf(values.attention_pic)] || { name: "", email: "", phone_number: "" };

          setLoading(true);
          updateInvoice(
            docID,
            { ...values, attention_pic: attention_pic_info },
            user!,
            UPDATE_ACTION,
            () => {
              updateJobConfirmation(
                data.job_confirmation_id,
                { invoice_secondary_id: data.display_id, invoice_status: DRAFT }, user!,
                () => {
                  linkTo(`/invoices/${docID}/edit/cont`);
                  setLoading(false);
                }, (error) => {
                  console.error(error);
                }
              );
            }, (error) => {
              console.error(error)
            })
        }}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View>

            <FormDateInputField
              label="Invoice Date"
              required={true}
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
              value={customerData.address || ""}
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
              value={customerData.telephone || ""}
              editable={false}
            />

            <FormTextInputField
              label="Fax"
              value={customerData.fax || ""}
              editable={false}
            />

            <FormTextInputField
              label="Customer Account No (e.g. 3000-C012)"
              value={customerData.account_no || ""}
              editable={false}
            />

            <RegularButton text="Next" operation={() => { handleSubmit(); }} loading={loading} />

          </View>
        )}
      </Formik>

    </Body>
  )
}

export default EditInvoiceFormScreen;
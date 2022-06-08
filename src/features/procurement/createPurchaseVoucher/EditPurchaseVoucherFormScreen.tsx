import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import UploadButton from '../../../components/molecules/buttons/UploadButton';
import { Formik } from 'formik';
import { useTailwind } from 'tailwind-rn';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import ViewPageHeaderText from '../../../components/molecules/display/ViewPageHeaderText';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { useCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { BANKS, PURCHASE_VOUCHERS } from '../../../constants/Firebase';
import { View } from 'react-native';
import * as Yup from 'yup';
import { updatePurchaseVoucher } from '../../../services/PurchaseVoucherServices';
import { PurchaseVoucher } from '../../../types/PurchaseVoucher';
import { UploadFile } from '../../../services/StorageServices';
import { Bank } from '../../../types/Bank';
import { getBankNameList } from '../../../helpers/BankHelper';
import { DRAFT, REJECTED } from '../../../types/Common';
import Unauthorized from '../../../components/atoms/unauthorized/Unauthorized';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import TextLabel from '../../../components/atoms/typography/TextLabel';



const formSchema = Yup.object().shape({
  purchase_voucher_date: Yup.string().required("Required"),
  proforma_invoice_no: Yup.string().required("Required"),
  proforma_invoice_date: Yup.string().required("Required"),
  proforma_invoice_file: Yup.object().shape({
    filename: Yup.string().required("Required"),
  }),
  original_amount: Yup.string().required("Required"),
});

const EditPurchaseVoucherFormScreen = ({ navigation, route }: RootNavigationProps<"EditPurchaseVoucherForm">) => {
  const tailwind = useTailwind();
  const [fileUpdated, setFileUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageFilename, setStorageFilename] = useState<string | undefined>(undefined);
  const { docID } = route.params;
  const user = useSelector(UserSelector);
  const allowedStatuses = [DRAFT, REJECTED];
  let displayID: string = "";
  let poData = {};

  let initialValues = {
    purchase_voucher_date: "",
    proforma_invoice_no: "",
    proforma_invoice_date: "",
    proforma_invoice_file: { filename: "", uri: "", file: undefined },
    filename_storage_proforma: "",
    purchase_order_id: "",
    purchase_order_secondary_id: "",
    original_amount: "",
    account_purchase_by: "",
    cheque_no: "",
    paid_amount: ""
  };

  const { data } = useDocument<PurchaseVoucher>(`${PURCHASE_VOUCHERS}/${docID}`, {
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

  displayID = data.display_id;

  initialValues = {
    purchase_voucher_date: `${new Date().getDate().toString()}/${+new Date().getMonth().toString() + 1}/${new Date().getFullYear().toString()}`,
    proforma_invoice_no: data.proforma_invoice_no || "",
    proforma_invoice_date: data.proforma_invoice_date || "",
    proforma_invoice_file: { filename: data.proforma_invoice_file, uri: "", file: undefined },
    filename_storage_proforma: data.filename_storage_proforma || "",
    purchase_order_id: data.purchase_order_id || "",
    purchase_order_secondary_id: data.purchase_order_secondary_id || "",
    original_amount: data.original_amount || "",
    account_purchase_by: data.account_purchase_by.name || "",
    cheque_no: data.cheque_no || "",
    paid_amount: data.paid_amount || ""
  };

  poData = {
    supplier: data.supplier,
    product: data.product,
    unit_of_measurement: data.unit_of_measurement,
    quantity: data.quantity,
    currency_rate: data.currency_rate,
    unit_price: data.unit_price,
    payment_term: data.payment_term,
    delivery_mode: data.delivery_mode,
    delivery_mode_type: data.delivery_mode_type,
    delivery_mode_details: data.delivery_mode_details,
    port: data.port,
    delivery_location: data.delivery_location,
    contact_person: data.contact_person,
    ETA_delivery_date: data.ETA_delivery_date,
    remarks: data.remarks,
  }


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
              bank_chosen = banks[bankList.indexOf(values.account_purchase_by || "")];
              bank_details = {
                id: bank_chosen.id,
                name: bank_chosen.name,
                account_no: bank_chosen.account_no,
                swift_code: bank_chosen.swift_code,
                address: bank_chosen.address,
              };
            }else{
              bank_details = "";
            }

            if (fileUpdated) {
              UploadFile(PURCHASE_VOUCHERS, values.proforma_invoice_file.file, values.proforma_invoice_file.filename, values.proforma_invoice_file.uri, () => { })
                .then(
                  filename_storage_output => {
                    setStorageFilename(filename_storage_output);
                    let data = {
                      ...values,
                      secondary_id: displayID,
                      proforma_invoice_file: values.proforma_invoice_file.filename,
                      filename_storage_proforma: filename_storage_output,
                      account_purchase_by: bank_details,
                      reject_notes: "",
                      ...poData,
                      created_by: user,
                      status: DRAFT
                    }
                    updatePurchaseVoucher(
                      docID,
                      data,
                      user!,
                      UPDATE_ACTION,
                      () => {
                        navigation.navigate("CreatePurchaseVoucherSummary", { docID: docID });
                        setFileUpdated(false);
                        setLoading(false);
                      }, (error) => {
                        console.log(error);
                      });
                  }).catch(err => {
                    setLoading(false);
                    setError(err.message);
                    console.log(err.message);
                  })
            } else {
              let data = {
                ...values,
                proforma_invoice_file: values.proforma_invoice_file.filename,
                filename_storage_proforma: storageFilename || values.filename_storage_proforma,
                account_purchase_by: bank_details,
                created_by: user,
                ...poData,
                reject_notes: "",
                status: DRAFT
              }
              updatePurchaseVoucher(
                docID,
                data,
                user!,
                UPDATE_ACTION,
                () => {
                  navigation.navigate("CreatePurchaseVoucherSummary", { docID: docID });
                  setLoading(false);
                }, (error) => {
                  console.log(error);
                });
            }

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

            <FormDateInputField
              label='Proforma Invoice Date'
              value={values.proforma_invoice_date}
              onChangeValue={text => setFieldValue("proforma_invoice_date", text)}
              required={true}
              hasError={errors.proforma_invoice_date && touched.proforma_invoice_date ? true : false}
              errorMessage={errors.proforma_invoice_date}
            />

            <FormTextInputField
              label="Proforma Invoice No."
              required={true}
              value={values.proforma_invoice_no}
              onChangeValue={text => setFieldValue("proforma_invoice_no", text)}
              hasError={errors.proforma_invoice_no && touched.proforma_invoice_no ? true : false}
              errorMessage={errors.proforma_invoice_no}
            />

            <UploadButton
              buttonText="Upload Proforma Invoice"
              value={values.proforma_invoice_file.filename}
              filename_storage={storageFilename || initialValues.filename_storage_proforma}
              path={PURCHASE_VOUCHERS}
              autoSave={false}
              onDelete={() => { updatePurchaseVoucher(docID, { proforma_invoice_file: "", filename_storage_proforma: "" }, user!, UPDATE_ACTION, () => { }, () => { }) }}
              setSelectedFile={file => {
                setFieldValue("proforma_invoice_file", file);
                setFileUpdated(true);

              }}
              hasError={errors.proforma_invoice_file?.filename && touched.proforma_invoice_file ? true : false}
              errorMessage={errors.proforma_invoice_file?.filename}
            />

            <FormTextInputField
              label="Purchase Order No."
              required={true}
              editable={false}
              value={values.purchase_order_secondary_id}
              onChangeValue={text => setFieldValue("purchase_order_secondary_id", text)}
            />

            <FormTextInputField
              label="Original Amount"
              required={true}
              editable={false}
              value={values.original_amount}
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

            {
              error
                ?
                <TextLabel content={error ?? ''} color='text-red-500' />
                :
                <></>
            }

            <RegularButton text="Review PV & Submit" operation={() => { handleSubmit() }} loading={loading} />
          </View>
        )}
      </Formik>
    </Body>
  )
}

export default EditPurchaseVoucherFormScreen;
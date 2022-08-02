import React, { useState } from 'react';
import { View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { FieldArray, Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import NewContact from '../../../components/templates/details/customers/create/NewContact';
import Header from '../../../components/atoms/typography/Header';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import * as Yup from 'yup';
import { createCustomer, deleteCustomer, updateCustomer } from '../../../services/CustomerServices';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { revalidateCollection, useCollection, useDocument } from '@nandorojo/swr-firestore';
import { CUSTOMERS, CUSTOMER_SEGMENTATIONS } from '../../../constants/Firebase';
import { Customer } from '../../../types/Customer';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

import AddButtonText from '../../../components/atoms/buttons/AddButtonText';
import { CustomerSegmentation } from '../../../types/CustomerSegmentation';
import AddNewSegmentation from '../../../components/templates/add/AddNewSegmentation';
import { useRefreshContext } from '../../../providers/RefreshProvider';
import { loadingDelay } from '../../../helpers/GenericHelper';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  telephone: Yup.string().required("Required"),
  fax: Yup.string().required("Required"),
  contact_persons: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Required"),
      email: Yup.string().required("Required"),
      phone_number: Yup.string().required("Required")
    })
  ),
  account_no: Yup.string().required("Required"),
  segmentation: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
});

const CustomerFormScreen = ({ navigation, route }: RootNavigationProps<"CreateCustomer" | "EditCustomer">) => {
  const docID: any = route.params?.docID;
  const user = useSelector(UserSelector);
  let customer_segmentations_list: Array<string> = [""];
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const refreshContext = useRefreshContext();

  const tailwind = useTailwind();

  const { data: customer } = useDocument<Customer>(`${CUSTOMERS}/${docID}`, {
    revalidateOnFocus: true
  });

  const { data: customer_segmentations } = useCollection<CustomerSegmentation>(`${CUSTOMER_SEGMENTATIONS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["deleted", "==", false]
  });


  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteCustomer(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(CUSTOMERS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    setLoading(true);
    loadingDelay(() => {
      setLoading(false);
      navigation.navigate("CustomerList");
    })

    refreshContext?.refreshList(CUSTOMERS);
  }

  if (!customer || !customer_segmentations) {
    return <LoadingData></LoadingData>
  }

  customer_segmentations_list = customer_segmentations.map(item => item.name);

  const onSubmit = (values: any, resetForm) => {
    setLoading(true);
    let customerSegSelected = customer_segmentations[customer_segmentations_list.indexOf(values.segmentation)]
    let customerSegData = {
      id: customerSegSelected.id,
      name: customerSegSelected.name,
      description: customerSegSelected.description
    }

    if (docID) {
      return updateCustomer(docID, customer?.name || '', { ...values, segmentation: customerSegData }, user!, UPDATE_ACTION, () => {
        setModalVisible(true);
        revalidateCollection(CUSTOMERS);
        resetForm();
        setLoading(false);

      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createCustomer({ ...values, segmentation: customerSegData }, user!, () => {
      setModalVisible(true);
      revalidateCollection(CUSTOMERS);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  return (
    <Body header={<HeaderStack title={"Customer Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? 'Edit Customer' : 'Create Customer'}`}
        color='text-black'
        alignment='text-left' />

      <Formik
        initialValues={{
          name: customer?.name || '',
          address: customer?.address || '',
          telephone: customer?.telephone || '',
          fax: customer?.fax || '',
          contact_persons: customer?.contact_persons || [{ name: '', email: '', phone_number: '' }],
          account_no: customer?.account_no || '',
          segmentation: customer?.segmentation ? customer?.segmentation.name : '',
          credit_limit: customer?.credit_limit || '',
          status: customer?.status || "Active",
          remarks: customer?.remarks || "",
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-4')}>
            <FormTextInputField
              label="Company Name"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name} />

            <FormTextInputField
              label="Address"
              value={values.address}
              onChangeValue={text => setFieldValue("address", text)}
              required={true}
              multiline={true}
              hasError={errors.address && touched.address ? true : false}
              errorMessage={errors.address} />

            <FormTextInputField
              label="Telephone"
              value={values.telephone}
              onChangeValue={text => setFieldValue("telephone", text)}
              required={true}
              hasError={errors.telephone && touched.telephone ? true : false}
              errorMessage={errors.telephone} />

            <FormTextInputField
              label="Fax"
              value={values.fax}
              onChangeValue={text => setFieldValue("fax", text)}
              required={true}
              hasError={errors.fax && touched.fax ? true : false}
              errorMessage={errors.fax} />

            <FieldArray name="contact_persons">
              {({ remove, push }) => (
                <View>
                  {values.contact_persons.length > 0 ? (
                    values.contact_persons.map((contact_person, index) => (
                      <NewContact
                        contact_persons={values.contact_persons}
                        index={index}
                        deleted={deleted}
                        handleDelete={() => {
                          remove(index);
                          setDeleted(!deleted)
                        }}
                        length={values.contact_persons.length}
                        key={index}
                        errors={errors.contact_persons && touched.contact_persons ? errors.contact_persons : undefined}
                      />
                    ))) : null}
                  <View style={tailwind('mb-3')}>
                    <AddNewButton
                      text="Add Another Contact Person"
                      onPress={() => push({ name: '', email: '', phone_number: '' })} />
                  </View>
                </View>
              )}
            </FieldArray>

            <FormTextInputField
              label="Customer Account No."
              value={values.account_no}
              onChangeValue={text => setFieldValue("account_no", text)}
              required={true}
              hasError={errors.account_no && touched.account_no ? true : false}
              errorMessage={errors.account_no} />

            <FormDropdownInputField
              label="Customer Segmentation."
              value={values.segmentation}
              items={customer_segmentations_list}
              onChangeValue={text => setFieldValue("segmentation", text)}
              required={true}
              hasError={errors.segmentation && touched.segmentation ? true : false}
              errorMessage={errors.segmentation} />

            <View style={tailwind("mb-3")}>
              <AddButtonText text="Create New Customer Segmentation" onPress={() => { setShowCreate(!showCreate) }} />

              {
                showCreate
                  ?
                  (
                    <View style={tailwind("mt-2")}>
                      <AddNewSegmentation onCancel={() => { setShowCreate(!showCreate) }} />
                    </View>
                  )
                  :
                  <></>
              }
            </View>

            <FormTextInputField
              label="Credit Limit."
              value={values.credit_limit}
              onChangeValue={text => setFieldValue("credit_limit", text)}
              required={true}
              hasError={errors.credit_limit && touched.credit_limit ? true : false}
              errorMessage={errors.credit_limit} />

            <FormDropdownInputField
              label="Status."
              value={values.status}
              items={[
                "Active",
                "Inactive"
              ]}
              onChangeValue={text => setFieldValue("status", text)}
              required={true}
              hasError={errors.status && touched.status ? true : false}
              errorMessage={errors.status} />

            <FormTextInputField
              label="Remarks"
              multiline={true}
              value={values.remarks}
              onChangeValue={text => setFieldValue("remarks", text)}
              required={true}
            />

            <View style={tailwind('flex flex-row flex-wrap')}>
              <RegularButton
                type="secondary"
                loading={loading}
                text="Cancel"
                operation={() => { navigation.navigate("CustomerList") }} />

              <RegularButton
                text={`${docID ? 'Update' : 'Add'}`}
                operation={() => { handleSubmit() }}
                loading={loading && !isDelete} />

              {
                docID
                  ?
                  <RegularButton                  
                    text="Delete"
                    type='secondary'
                    operation={() => { handleDelete() }}
                    loading={loading && isDelete} />
                  :
                  null
              }
            </View>

            {
              error == ""
                ?
                null
                :
                <TextLabel content={error} alignment='text-center' color='text-red-500' />
            }
          </View>
        )}
      </Formik>

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Customer Deleted' : docID ? 'Customer Updated' : 'Customer Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default CustomerFormScreen;
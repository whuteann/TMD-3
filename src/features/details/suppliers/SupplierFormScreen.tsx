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
import StatusModal from '../../../components/atoms/modal/StatusModal';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { SUPPLIERS } from '../../../constants/Firebase';
import { Supplier } from '../../../types/Supplier';
import FormDateInputField from '../../../components/molecules/input/FormDateInputField';
import { createSupplier, deleteSupplier, updateSupplier } from '../../../services/SupplierServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import LoadingData from '../../../components/atoms/loading/loadingData';


const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  contact_persons: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Required"),
      email: Yup.string().required("Required"),
      phone_number: Yup.string().required("Required")
    })
  ),
  telephone: Yup.string().required("Required"),
  year: Yup.string().required("Required"),
  email: Yup.string().required("Required"),
  product: Yup.string().required("Required"),
  remark: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
});

const SupplierFormScreen = ({ navigation, route }: RootNavigationProps<"CreateSupplier" | "EditSupplier">) => {
  const docID: any = route.params?.docID;

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const { data: supplier } = useDocument<Supplier>(`${SUPPLIERS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any) => {
    setLoading(true);

    if (docID) {
      return updateSupplier(docID, supplier?.name || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(SUPPLIERS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createSupplier(values, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(SUPPLIERS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteSupplier(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(SUPPLIERS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("SupplierList");
  }

  if (!supplier) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Supplier Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? 'Edit Supplier' : 'Create Supplier'}`}
        color='text-black'
        alignment='text-left' />

      <Formik
        initialValues={{
          name: supplier?.name || '',
          address: supplier?.address || '',
          contact_persons: supplier?.contact_persons || [{ name: '', email: '', phone_number: '' }],
          telephone: supplier?.telephone || '',
          year: supplier?.year || '',
          email: supplier?.email || '',
          product: supplier?.product || '',
          remark: supplier?.remark || '',
          status: supplier?.status || '',
          account_no: supplier?.account_no || '',
        }}
        onSubmit={(values) => { onSubmit(values) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-4')}>
            <FormTextInputField
              label="Name"
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
              label="Telephone"
              value={values.telephone}
              onChangeValue={text => setFieldValue("telephone", text)}
              required={true}
              hasError={errors.telephone && touched.telephone ? true : false}
              errorMessage={errors.telephone} />

            <FormDateInputField
              label='Year'
              value={values.year}
              onChangeValue={text => setFieldValue("year", text)}
              required={true}
              hasError={errors.year && touched.year ? true : false}
              errorMessage={errors.year} />

            <FormTextInputField
              label="Email"
              value={values.email}
              onChangeValue={text => setFieldValue("email", text)}
              required={true}
              hasError={errors.email && touched.email ? true : false}
              errorMessage={errors.email} />

            <FormTextInputField
              label="Product/Service Supply"
              value={values.product}
              onChangeValue={text => setFieldValue("product", text)}
              required={true}
              hasError={errors.product && touched.product ? true : false}
              errorMessage={errors.product} />

            <FormTextInputField
              label="Customer Account No."
              value={values.account_no}
              onChangeValue={text => setFieldValue("account_no", text)}
              required={true}
              hasError={errors.account_no && touched.account_no ? true : false}
              errorMessage={errors.account_no} />

            <View style={tailwind('flex flex-row justify-between')}>
              <View style={tailwind('w-1/2 px-2 -mx-2')}>
                <FormDropdownInputField
                  label="Remark"
                  value={values.remark}
                  items={["Crucial", "Non-crucial"]}
                  onChangeValue={(val) => { setFieldValue("remark", val) }}
                  required={true}
                  hasError={errors.remark && touched.remark ? true : false}
                  errorMessage={errors.remark}
                />
              </View>

              <View style={tailwind('w-1/2 px-2 -mx-2')}>
                <FormDropdownInputField
                  label="Status"
                  value={values.status}
                  items={["Active", "In-Active"]}
                  onChangeValue={(val) => { setFieldValue("status", val) }}
                  required={true}
                  hasError={errors.status && touched.status ? true : false}
                  errorMessage={errors.status}
                />
              </View>
            </View>

            <View style={tailwind('flex flex-row flex-wrap')}>
              <RegularButton
                type="secondary"
                text="Cancel"
                operation={() => { navigation.navigate("SupplierList") }} />

              <RegularButton
                text={`${docID ? "Update" : "Add"}`}
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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Supplier Deleted' : docID ? 'Supplier Updated' : 'Supplier Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default SupplierFormScreen;
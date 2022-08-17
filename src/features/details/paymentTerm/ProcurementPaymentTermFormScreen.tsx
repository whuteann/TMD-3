import React, { useState } from 'react';
import { View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { PROCUREMENT_PAYMENT_TERMS } from '../../../constants/Firebase';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';
import { PaymentTerm } from '../../../types/PaymentTerm';
import { createPaymentTermProcurement, deletePaymentTermProcurement, updatePaymentTermProcurement } from '../../../services/ProcurementPaymentTermServices';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
});

const ProcurementPaymentTermFormScreen = ({ navigation, route }: RootNavigationProps<"CreateProcurementPaymentTerm" | "EditProcurementPaymentTerm">) => {
  const docID: any = route.params?.docID;

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const { data: payment_term } = useDocument<PaymentTerm>(`${PROCUREMENT_PAYMENT_TERMS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any) => {
    setLoading(true);

    if (docID) {
      return updatePaymentTermProcurement(docID, payment_term?.name || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(PROCUREMENT_PAYMENT_TERMS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createPaymentTermProcurement(values, user!, () => {
      setLoading(false);
      setModalVisible(true);

      revalidateCollection(PROCUREMENT_PAYMENT_TERMS);

    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deletePaymentTermProcurement(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(PROCUREMENT_PAYMENT_TERMS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("ProcurementPaymentTermList");
  }

  if (!payment_term) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Payment Term Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? 'Edit Payment Term' : 'Create Payment Term'}`}
        color='text-black'
        alignment='text-left' />

      <Formik
        initialValues={{
          name: payment_term.name || '',
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

            <View style={tailwind("mb-10")} />

            <View style={tailwind('flex flex-row flex-wrap')}>
              <RegularButton
                type="secondary"
                text="Cancel"
                operation={() => { navigation.navigate("ProcurementPaymentTermList") }} />

              {
                docID
                  ?
                  <RegularButton
                    text="Update"
                    operation={() => { handleSubmit() }}
                    loading={loading && !isDelete} />
                  :
                  <RegularButton
                    text="Add"
                    operation={() => { handleSubmit() }}
                    loading={loading && !isDelete} />
              }
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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Payment Term Deleted' : docID ? 'Payment Term Updated' : 'Payment Term Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default ProcurementPaymentTermFormScreen;
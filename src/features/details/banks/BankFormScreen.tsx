import React, { useState } from 'react';
import { View } from 'react-native';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { BANKS } from '../../../constants/Firebase';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { Bank } from '../../../types/Bank';
import { createBank, deleteBank, updateBank } from '../../../services/BankServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  account_no: Yup.string().required("Required"),
  swift_code: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
});

const BankFormScreen = ({ navigation, route }: RootNavigationProps<"CreateBank" | "EditBank">) => {
  const docID: any = route.params?.docID;

  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const { data: bank } = useDocument<Bank>(`${BANKS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any, resetForm) => {
    setDelete(false);
    setLoading(true);

    if (docID) {
      return updateBank(docID, bank?.account_no || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(BANKS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createBank(values, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(BANKS);
      resetForm();
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteBank(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(BANKS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("BankList");
  }

  if (!bank) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Bank Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? 'Create Bank' : 'Edit Bank'}`}
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          name: bank?.name || '',
          account_no: bank?.account_no || '',
          swift_code: bank?.swift_code || '',
          address: bank?.address || '',
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-3')}>
            <FormTextInputField
              label="Bank Account Name"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name} />

            <FormTextInputField
              label="Bank Account No"
              value={values.account_no}
              onChangeValue={text => setFieldValue("account_no", text)}
              required={true}
              hasError={errors.account_no && touched.account_no ? true : false}
              errorMessage={errors.account_no} />

            <FormTextInputField
              label="Swift Code"
              value={values.swift_code}
              onChangeValue={text => setFieldValue("swift_code", text)}
              required={true}
              hasError={errors.swift_code && touched.swift_code ? true : false}
              errorMessage={errors.swift_code} />

            <FormTextInputField
              label="Address"
              value={values.address}
              onChangeValue={text => setFieldValue("address", text)}
              required={true}
              multiline={true}
              hasError={errors.address && touched.address ? true : false}
              errorMessage={errors.address} />

            <RegularButton
              text="Save"
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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Bank Deleted' : docID ? 'Bank Updated' : 'Bank Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default BankFormScreen;
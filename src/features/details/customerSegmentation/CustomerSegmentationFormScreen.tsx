import React, { useState } from 'react';
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
import LoadingData from '../../../components/atoms/loading/loadingData';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { CustomerSegmentation } from '../../../types/CustomerSegmentation';
import { CUSTOMER_SEGMENTATIONS } from '../../../constants/Firebase';
import { createCustomerSegmentation, deleteCustomerSegmentation, updateCustomerSegmentation } from '../../../services/CustomerSegmentationServices';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
});

const CustomerSegmentationFormScreen = ({ navigation, route }: RootNavigationProps<"CreateCustomerSegmentation" | "EditCustomerSegmentation">) => {
  const docID: any = route.params?.docID;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDelete, setDelete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);

  const { data: customer_segmentation } = useDocument<CustomerSegmentation>(`${CUSTOMER_SEGMENTATIONS}/${docID}`);

  const onSubmit = (values: any, resetForm) => {
    setLoading(true);

    if (docID) {
      return updateCustomerSegmentation(docID, values, user!, () => {
        revalidateCollection(CUSTOMER_SEGMENTATIONS);
        setLoading(false);
        setModalVisible(true);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createCustomerSegmentation(values, user!, () => {
      revalidateCollection(CUSTOMER_SEGMENTATIONS);
      setLoading(false);
      setModalVisible(true);
      resetForm();
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("CustomerSegmentationList");
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteCustomerSegmentation(docID, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(CUSTOMER_SEGMENTATIONS);
    }, () => {
      setLoading(false);
      setError(error);
    });
  }

  if (!customer_segmentation) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={`${docID ? "Edit" : "New"} Customer Segmentation`} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title="Customer Segmentation"
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          name: customer_segmentation?.name || '',
          description: customer_segmentation?.description || ''
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm); }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-3')}>
            <FormTextInputField
              label="Name"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name} />

            <FormTextInputField
              label="Description"
              placeholder='Insert new description'
              value={values.description}
              onChangeValue={text => setFieldValue("description", text)}
              multiline={true}
              hasError={errors.description && touched.description ? true : false}
              errorMessage={errors.description} />

            <RegularButton
              text="Save"
              operation={() => { handleSubmit() }}
              loading={loading} />

            {
              docID
                ?
                <RegularButton
                  type="secondary"
                  text="Delete Customer Segmentation"
                  operation={() => { handleDelete() }} />
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

      <StatusModal visible={modalVisible} message={`${docID ? 'Customer Segmentation Updated' : 'Customer Segmentation Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default CustomerSegmentationFormScreen;
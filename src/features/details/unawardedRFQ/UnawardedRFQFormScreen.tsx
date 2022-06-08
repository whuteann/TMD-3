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
import { createRFQ, deleteRFQ, updateRFQ } from '../../../services/RFQServices';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { RFQS } from '../../../constants/Firebase';
import { RFQ } from './../../../types/RFQ';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

const formSchema = Yup.object().shape({
  code: Yup.string().required("Required"),
  reason: Yup.string().required("Required"),
});

const UnawardedRFQFormScreen = ({ navigation, route }: RootNavigationProps<"CreateUnawardedRFQ" | "EditUnawardedRFQ">) => {
  const docID: any = route.params?.docID;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDelete, setDelete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);

  const { data: rfq } = useDocument<RFQ>(`${RFQS}/${docID}`);

  const onSubmit = (values: any, resetForm) => {
    setLoading(true);

    if (docID) {
      return updateRFQ(docID, rfq?.code || '', values, user!, UPDATE_ACTION, () => {
        revalidateCollection(RFQS);
        setLoading(false);
        setModalVisible(true);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createRFQ(values, user!, () => {
      revalidateCollection(RFQS);
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
    navigation.navigate("UnawardedRFQList");
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteRFQ(docID, user, () => { 
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(RFQS); 
    }, () => {
      setLoading(false);
      setError(error);
    });
  }

  if (!rfq) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={`${docID ? "Edit" : "New"} Reason`} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title="Un-awarded RFQ reason"
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          code: rfq?.code || '',
          reason: rfq?.reason || ''
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm); }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-3')}>
            <FormTextInputField
              label="Code"
              value={values.code}
              onChangeValue={text => setFieldValue("code", text)}
              required={true}
              hasError={errors.code && touched.code ? true : false}
              errorMessage={errors.code} />

            <FormTextInputField
              label="Reason"
              placeholder='Insert new reason'
              value={values.reason}
              onChangeValue={text => setFieldValue("reason", text)}
              required={true}
              multiline={true}
              hasError={errors.reason && touched.reason ? true : false}
              errorMessage={errors.reason} />

            <RegularButton
              text="Save"
              operation={() => { handleSubmit() }}
              loading={loading} />

            {
              docID
                ?
                <RegularButton
                  type="secondary"
                  text="Delete Reason"
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

      <StatusModal visible={modalVisible} message={`${docID ? 'RFQ Updated' : 'RFQ Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default UnawardedRFQFormScreen;
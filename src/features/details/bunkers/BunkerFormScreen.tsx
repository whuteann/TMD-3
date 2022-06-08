import React, { useState } from 'react';
import { View } from 'react-native';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { Bunker } from '../../../types/Bunker';
import { BUNKERS } from '../../../constants/Firebase';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { createBunker, updateBunker } from '../../../services/BunkerServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';


const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  official_number: Yup.string().required("Required"),
  imo_number: Yup.string().required("Required"),
  flag: Yup.string().required("Required"),
  call_sign: Yup.string().required("Required"),
  net_tonnage: Yup.string().required("Required"),
  gross_tonnage: Yup.string().required("Required"),
  sdwt: Yup.string().required("Required"),
  loa: Yup.string().required("Required"),
  depth: Yup.string().required("Required"),
  capacity: Yup.string().required("Required"),
});

const BunkerFormScreen = ({ navigation, route }: RootNavigationProps<"CreateBunker" | "EditBunker">) => {
  const docID: any = route.params?.docID;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDelete, setDelete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);

  const tailwind = useTailwind();

  const { data: bunker } = useDocument<Bunker>(`${BUNKERS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any, resetForm) => {
    setLoading(true);

    if (docID) {
      return updateBunker(docID, bunker?.official_number || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createBunker(values, user!, () => {
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
    navigation.navigate("BunkerBargeList");
  }

  //   const handleDelete = () => {
  //     setDelete(true);
  //     setLoading(true);

  //     return deleteBunker(docID, () => {
  //       setLoading(false);
  //       setModalVisible(true);
  //       revalidateCollection(BUNKERS);
  //     }, (error) => {
  //       setLoading(false);
  //       setError(error);
  //     });
  //   }

  if (!bunker) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Bunker Barge Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title='Add Bunker Barge'
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          name: bunker?.name || '',
          official_number: bunker?.official_number || '',
          imo_number: bunker?.imo_number || '',
          flag: bunker?.flag || '',
          call_sign: bunker?.call_sign || '',
          net_tonnage: bunker?.net_tonnage || '',
          gross_tonnage: bunker?.gross_tonnage || '',
          sdwt: bunker?.sdwt || '',
          loa: bunker?.loa || '',
          depth: bunker?.depth || '',
          capacity: bunker?.capacity || ''
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm) }}
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
              label="Official No"
              value={values.official_number}
              onChangeValue={text => setFieldValue("official_number", text)}
              required={true}
              hasError={errors.official_number && touched.official_number ? true : false}
              errorMessage={errors.official_number} />

            <FormTextInputField
              label="IMO No"
              value={values.imo_number}
              onChangeValue={text => setFieldValue("imo_number", text)}
              required={true}
              hasError={errors.imo_number && touched.imo_number ? true : false}
              errorMessage={errors.imo_number} />

            <FormTextInputField
              label="Flag"
              value={values.flag}
              onChangeValue={text => setFieldValue("flag", text)}
              required={true}
              hasError={errors.flag && touched.flag ? true : false}
              errorMessage={errors.flag} />

            <FormTextInputField
              label="Call Sign"
              value={values.call_sign}
              onChangeValue={text => setFieldValue("call_sign", text)}
              required={true}
              hasError={errors.call_sign && touched.call_sign ? true : false}
              errorMessage={errors.call_sign} />

            <FormTextInputField
              label="Net Tonnage"
              value={values.net_tonnage}
              onChangeValue={text => setFieldValue("net_tonnage", text)}
              required={true}
              hasError={errors.net_tonnage && touched.net_tonnage ? true : false}
              errorMessage={errors.net_tonnage} />

            <FormTextInputField
              label="Gross Tonnage"
              value={values.gross_tonnage}
              onChangeValue={text => setFieldValue("gross_tonnage", text)}
              required={true}
              hasError={errors.gross_tonnage && touched.gross_tonnage ? true : false}
              errorMessage={errors.gross_tonnage} />

            <FormTextInputField
              label="SDWT"
              value={values.sdwt}
              onChangeValue={text => setFieldValue("sdwt", text)}
              required={true}
              hasError={errors.sdwt && touched.sdwt ? true : false}
              errorMessage={errors.sdwt} />

            <FormTextInputField
              label="LOA"
              value={values.loa}
              onChangeValue={text => setFieldValue("loa", text)}
              required={true}
              hasError={errors.loa && touched.loa ? true : false}
              errorMessage={errors.loa} />

            <FormTextInputField
              label="Depth"
              value={values.depth}
              onChangeValue={text => setFieldValue("depth", text)}
              required={true}
              hasError={errors.depth && touched.depth ? true : false}
              errorMessage={errors.depth} />

            <FormTextInputField
              label="Capacity"
              value={values.capacity}
              onChangeValue={text => setFieldValue("capacity", text)}
              required={true}
              hasError={errors.capacity && touched.capacity ? true : false}
              errorMessage={errors.capacity} />

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
                  operation={() => {
                    //  handleDelete()
                  }}
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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Bunker Deleted' : docID ? 'Bunker Updated' : 'Bunker Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default BunkerFormScreen;
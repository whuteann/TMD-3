import React, { useState } from 'react';
import { View } from 'react-native';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { SHIP_SPARES } from '../../../constants/Firebase';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { ShipSpare } from '../../../types/ShipSpare';
import { createShipSpare, deleteShipSpare, updateShipSpare } from '../../../services/ShipSpareServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

const formSchema = Yup.object().shape({
  product_code: Yup.string().required("Required"),
  product_description: Yup.string().required("Required"),
  group: Yup.string().required("Required"),
  uom: Yup.string().required("Required"),
  ref_price: Yup.string().required("Required"),
});

const ShipSpareFormScreen = ({ navigation, route }: RootNavigationProps<"CreateShipSpare" | "EditShipSpare">) => {
  const docID: any = route.params?.docID;

  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const { data: shipSpare } = useDocument<ShipSpare>(`${SHIP_SPARES}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any, resetForm) => {
    setDelete(false);
    setLoading(true);

    if (docID) {
      return updateShipSpare(docID, shipSpare?.product_code || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(SHIP_SPARES);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createShipSpare(values, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(SHIP_SPARES);
      resetForm();
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteShipSpare(docID, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(SHIP_SPARES);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("ShipSpareList");
  }

  if (!shipSpare) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Ship Spare Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? "Edit" : "Add"} Ship Spare`}
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          product_code: shipSpare?.product_code || '',
          product_description: shipSpare?.product_description || '',
          group: shipSpare?.group || '',
          uom: shipSpare?.uom || '',
          ref_price: shipSpare?.ref_price || '',
          quantity: shipSpare?.quantity || '',
          serial_number: shipSpare?.serial_number || ''
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-3')}>
            <FormTextInputField
              label="Product Code"
              value={values.product_code}
              onChangeValue={text => setFieldValue("product_code", text)}
              required={true}
              hasError={errors.product_code && touched.product_code ? true : false}
              errorMessage={errors.product_code} />

            <FormTextInputField
              label="Product Description"
              value={values.product_description}
              onChangeValue={text => setFieldValue("product_description", text)}
              required={true}
              multiline={true}
              hasError={errors.product_description && touched.product_description ? true : false}
              errorMessage={errors.product_description} />

            <FormTextInputField
              label="Group"
              value={values.group}
              onChangeValue={text => setFieldValue("group", text)}
              required={true}
              hasError={errors.group && touched.group ? true : false}
              errorMessage={errors.group} />

            <FormTextInputField
              label="UOM"
              value={values.uom}
              onChangeValue={text => setFieldValue("uom", text)}
              required={true}
              hasError={errors.uom && touched.uom ? true : false}
              errorMessage={errors.uom} />

            <FormTextInputField
              label="Ref Price"
              value={values.ref_price}
              onChangeValue={text => setFieldValue("ref_price", text)}
              required={true}
              hasError={errors.ref_price && touched.ref_price ? true : false}
              errorMessage={errors.ref_price} />

            <FormTextInputField
              label="Quantity"
              value={values.quantity}
              onChangeValue={text => setFieldValue("quantity", text)}
            />

            <FormTextInputField
              label="Serial Number"
              value={values.serial_number}
              onChangeValue={text => setFieldValue("serial_number", text)}
            />

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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Ship Spare Deleted' : docID ? 'Ship Spare Updated' : 'Ship Spare Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default ShipSpareFormScreen;
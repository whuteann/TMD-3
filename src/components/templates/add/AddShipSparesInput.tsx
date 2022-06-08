import React, { useState } from 'react';
import TextLabel from '../../atoms/typography/TextLabel';
import RegularButton from '../../atoms/buttons/RegularButton';
import TextInputField from '../../atoms/input/text/TextInputField';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import MultilineTextInputField from '../../atoms/input/text/MultilineTextInputField';
import { Formik } from 'formik';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import { SHIP_SPARES } from '../../../constants/Firebase';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { createShipSpare } from '../../../services/ShipSpareServices';

interface InputProps {
  onCancel: () => void,
}

const formSchema = Yup.object().shape({
  product_code: Yup.string().required("Required"),
  product_description: Yup.string().required("Required"),
  group: Yup.string().required("Required"),
  uom: Yup.string().required("Required"),
  ref_price: Yup.string().required("Required"),
  quantity: Yup.string().required("Required"),
  serial_number: Yup.string().required("Required")
});

const AddShipSparesInput: React.FC<InputProps> = ({
  onCancel
}) => {

  const tailwind = useTailwind();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector(UserSelector);
  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("mb-3")}>
        <TextLabel content="Create Ship Spares" style={tailwind("font-black")} />
      </View>

      <Formik
        initialValues={{
          product_code: '',
          product_description: '',
          group: '',
          uom: '',
          ref_price: '',
          quantity: '',
          serial_number: ''
        }}
        onSubmit={(values, { resetForm }) => {
          setLoading(true);

          createShipSpare(values, user!, () => {
            setLoading(false);
            onCancel();
            resetForm();
            revalidateCollection(SHIP_SPARES);
          }, (error) => {
            setLoading(false);
            setError(error);
          });
        }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit, resetForm }) => (
          <View>

            <TextInputField
              placeholder="Product Code"
              value={values.product_code}
              onChangeText={text => setFieldValue("product_code", text)}
              hasError={errors.product_code && touched.product_code ? true : false}
              errorMessage={errors.product_code} />

            <MultilineTextInputField
              placeholder="Product Description"
              value={values.product_description}
              onChangeText={text => setFieldValue("product_description", text)}
              hasError={errors.product_description && touched.product_description ? true : false}
              errorMessage={errors.product_description} />

            <TextInputField
              placeholder="Group"
              value={values.group}
              onChangeText={text => setFieldValue("group", text)}
              hasError={errors.group && touched.group ? true : false}
              errorMessage={errors.group} />

            <TextInputField
              placeholder="UOM"
              value={values.uom}
              onChangeText={text => setFieldValue("uom", text)}
              hasError={errors.uom && touched.uom ? true : false}
              errorMessage={errors.uom} />

            <TextInputField
              placeholder="Ref Price"
              value={values.ref_price}
              onChangeText={text => setFieldValue("ref_price", text)}
              hasError={errors.ref_price && touched.ref_price ? true : false}
              errorMessage={errors.ref_price} />

            <TextInputField
              placeholder="Quantity"
              value={values.quantity}
              onChangeText={text => setFieldValue("quantity", text)}
            />

            <TextInputField
              placeholder="Serial Number"
              value={values.serial_number}
              onChangeText={text => setFieldValue("serial_number", text)}
            />
            {
              !error
                ?
                null
                :
                <TextLabel content={error} alignment='text-center' color='text-red-500' />
            }
            <View style={tailwind("flex-row")}>
              <View style={tailwind("w-[48%] mr-4")}>
                <RegularButton text="Cancel" type="secondary" operation={() => { onCancel(); resetForm(); }} />
              </View>
              <View style={tailwind("w-[48%]")}>
                <RegularButton text="Add" loading={loading} operation={() => { handleSubmit(); }} />
              </View>
            </View>

          </View>
        )}
      </Formik>
    </View >
  )
}

export default AddShipSparesInput;
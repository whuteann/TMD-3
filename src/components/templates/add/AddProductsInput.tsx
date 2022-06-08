import React, { useState } from 'react';
import TextLabel from '../../atoms/typography/TextLabel';
import RegularButton from '../../atoms/buttons/RegularButton';
import TextInputField from '../../atoms/input/text/TextInputField';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';
import MultilineTextInputField from '../../atoms/input/text/MultilineTextInputField';
import { Formik } from 'formik';
import { createProduct } from '../../../services/ProductServices';
import { revalidateCollection } from '@nandorojo/swr-firestore';
import { PRODUCTS } from '../../../constants/Firebase';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';

interface InputProps {
  onCancel: () => void,
}

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  sku: Yup.string().required("Required"),
  description: Yup.string().required("Required")
})

const AddProductsInput: React.FC<InputProps> = ({
  onCancel
}) => {

  const tailwind = useTailwind();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector(UserSelector);
  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("mb-3")}>
        <TextLabel content="Create New Product" style={tailwind("font-black")} />
      </View>

      <Formik
        initialValues={{
          name: '',
          sku: '',
          description: ''
        }}
        onSubmit={(values, { resetForm }) => {
          setLoading(true);

          createProduct(values, user!, () => {
            revalidateCollection(PRODUCTS);
            setLoading(false);
            onCancel();
            resetForm();
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
              value={values.name}
              onChangeText={(val) => { setFieldValue("name", val) }}
              placeholder="Product Name"
              shadow={true}
              style={tailwind("m-0")}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name}
            />
            <TextInputField
              value={values.sku}
              onChangeText={(val) => { setFieldValue("sku", val) }}
              placeholder="SKU Number"
              shadow={true}
              style={tailwind("m-0")}
              hasError={errors.sku && touched.sku ? true : false}
              errorMessage={errors.sku}
            />
            <MultilineTextInputField
              value={values.description}
              onChangeText={(val) => { setFieldValue("description", val) }}
              placeholder="Product Description"
              shadow={true}
              style={tailwind("m-0")}
              hasError={errors.description && touched.description ? true : false}
              errorMessage={errors.description}
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

export default AddProductsInput;
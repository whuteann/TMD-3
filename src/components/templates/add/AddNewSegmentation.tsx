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
import { CUSTOMER_SEGMENTATIONS, PRODUCTS } from '../../../constants/Firebase';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { createCustomerSegmentation } from '../../../services/CustomerSegmentationServices';

interface InputProps {
  onCancel: () => void,
}

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
})

const AddNewSegmentation: React.FC<InputProps> = ({
  onCancel
}) => {

  const tailwind = useTailwind();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector(UserSelector);
  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("mb-3")}>
        <TextLabel content="Create New Customer Segmentation" style={tailwind("font-black")} />
      </View>

      <Formik
        initialValues={{
          name: '',
          description: ''
        }}
        onSubmit={(values, { resetForm }) => {
          setLoading(true);

          createCustomerSegmentation(values, user!, () => {
            revalidateCollection(CUSTOMER_SEGMENTATIONS);
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
              placeholder="Customer Segmentation Name"
              shadow={true}
              style={tailwind("m-0")}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name}
            />
            <MultilineTextInputField
              value={values.description}
              onChangeText={(val) => { setFieldValue("description", val) }}
              placeholder="Customer Segmentation Description"
              shadow={true}
              style={tailwind("m-0")}
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

export default AddNewSegmentation;
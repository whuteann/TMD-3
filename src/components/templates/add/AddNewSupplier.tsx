import React from 'react';
import RegularButton from '../../atoms/buttons/RegularButton';
import TextLabel from '../../atoms/typography/TextLabel';
import { useTailwind } from 'tailwind-rn/dist';
import TextInputField from '../../atoms/input/text/TextInputField';
import FormDouble from '../../molecules/alignment/FormDouble';
import DropdownField from '../../atoms/input/dropdown/DropdownField';
import { View } from 'react-native';
import { Formik } from 'formik';

interface InputProps {
  onCancel: () => void,
}

let initialValues = {
  name: "",
  address: "",
  telephone: "",
  email: "",
  product: "",
  remark: "",
  status: "",
}

const AddNewSupplier: React.FC<InputProps> = ({
  onCancel
}) => {
  const tailwind = useTailwind();

  return (
    <View>
      <TextLabel content={"Create New Supplier"} style={tailwind(`font-bold mr-1 mb-2 mt-3`)} />
      <Formik
        initialValues={initialValues}
        onSubmit={() => { }}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit, resetForm }) => (
          <View>
            <TextInputField
              placeholder='Vendor Name'
              onChangeText={(text)=>{}}
            />
            <TextInputField placeholder='Vendor Address' />
            <TextInputField placeholder='Telephone' />
            <TextInputField placeholder='Email' />
            <TextInputField placeholder='Product/ Service Supply' />
            <FormDouble
              left={<DropdownField placeholder='Remark' items={["Crucial", "Non-crucial"]} />}
              right={<DropdownField placeholder='Status' items={["Active", "In-Active"]} />}
            />
            <FormDouble
              left={<RegularButton text="Cancel" operation={onCancel} />}
              right={<RegularButton text="Add" type="secondary" operation={() => { console.log('Added') }} />}
            />
          </View>
        )}
      </Formik>
    </View>
  )
}

export default AddNewSupplier;
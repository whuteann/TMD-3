import React, { useState } from 'react';
import { View } from 'react-native';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { PRODUCTS } from '../../../constants/Firebase';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { Product } from '../../../types/Product';
import { createProduct, deleteProduct, updateProduct } from '../../../services/ProductServices';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  sku: Yup.string().required("Required"),
  description: Yup.string().required("Required")
});

const ProductFormScreen = ({ navigation, route }: RootNavigationProps<"CreateProduct" | "EditProduct">) => {
  const docID: any = route.params?.docID;

  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);  
	const [error, setError] = useState(""); 
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);

  const tailwind = useTailwind();

  const { data: product } = useDocument<Product>(`${PRODUCTS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any, resetForm) => {
    setDelete(false);
    setLoading(true);

    if(docID) {
      return updateProduct(docID, product?.sku || '', values, user!, UPDATE_ACTION,  () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(PRODUCTS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createProduct(values, user!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(PRODUCTS);
      resetForm();
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteProduct(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(PRODUCTS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("ProductList");
  }

  if(!product) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Product Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header 
        title={ `${ docID ? 'Create Product' : 'Edit Product' }` } 
        alignment='text-left'
        color='text-black' />

      <Formik
        initialValues={{
          name: product?.name || '',
          sku: product?.sku || '',
          description: product?.description || ''
        }}
        onSubmit={(values, { resetForm }) => { onSubmit(values, resetForm) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-3')}>
            <FormTextInputField
              label="Name of Product"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name} />

            <FormTextInputField
              label="SKU Code"
              value={values.sku}
              onChangeValue={text => setFieldValue("sku", text)}
              required={true}
              hasError={errors.sku && touched.sku ? true : false}
              errorMessage={errors.sku} />

            <FormTextInputField
              label="Description"
              value={values.description}
              onChangeValue={text => setFieldValue("description", text)}
              required={true}
              multiline={true}
              hasError={errors.description && touched.description ? true : false}
              errorMessage={errors.description} />

            <RegularButton 
              text="Save" 
              operation={() => { handleSubmit()}} 
              loading={loading && !isDelete} />

            {
              docID
              ?
                <RegularButton 
                text="Delete" 
                type='secondary'
                operation={() => { handleDelete()}}
                loading={loading && isDelete} />
              :
                null
            }

            {
              error == ""
                ?
                  null
                :
                  <TextLabel content={ error } alignment='text-center' color='text-red-500' />
            }
          </View>
        )}
      </Formik>

      <StatusModal visible={ modalVisible } message={ `${ isDelete ? 'Product Deleted' : docID ? 'Product Updated' : 'Product Created' }` } onClose={ () => onCloseModal() }></StatusModal>
    </Body>
  )
}

export default ProductFormScreen;
import React, { useState } from 'react';
import { View } from 'react-native';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import { FieldArray, Formik } from 'formik';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import Header from '../../../components/atoms/typography/Header';
import * as Yup from 'yup';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import { PORTS } from '../../../constants/Firebase';
import { Port } from '../../../types/Port';
import NewLocation from '../../../components/templates/details/ports/form/NewLocation';
import { createPort, deletePort, updatePort } from '../../../services/PortServices';
import LoadingData from '../../../components/atoms/loading/loadingData';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import { UPDATE_ACTION } from '../../../constants/Action';

const formSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  delivery_locations: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Required"),
    })
  )
});

const PortFormScreen = ({ navigation, route }: RootNavigationProps<"CreatePort" | "EditPort">) => {
  const docID: any = route.params?.docID;

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const { data: port } = useDocument<Port>(`${PORTS}/${docID}`, {
    revalidateOnFocus: true
  });

  const onSubmit = (values: any) => {
    setLoading(true);

    if (docID) {
      return updatePort(docID, port?.name || '', values, user!, UPDATE_ACTION, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(PORTS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createPort(values, user!, () => {
      setLoading(false);
      setModalVisible(true);

      revalidateCollection(PORTS);

    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deletePort(docID, user, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(PORTS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("PortList");
  }

  if (!port) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={"Port Details"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Header
        title={`${docID ? 'Create Port' : 'Edit Port'}`}
        color='text-black'
        alignment='text-left' />

      <Formik
        initialValues={{
          name: port?.name || '',
          delivery_locations: port?.delivery_locations || [{ name: '' }],
        }}
        onSubmit={(values) => { onSubmit(values) }}
        validationSchema={formSchema}
      >
        {({ errors, touched, values, setFieldValue, handleSubmit }) => (
          <View style={tailwind('mt-4')}>
            <FormTextInputField
              label="Port Name"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name} />

            <FieldArray name="delivery_locations">
              {({ remove, push }) => (
                <View>
                  {values.delivery_locations.length > 0 ? (
                    values.delivery_locations.map((delivery_location, index) => (
                      <NewLocation
                        delivery_locations={values.delivery_locations}
                        index={index}
                        deleted={deleted}
                        handleDelete={() => {
                          remove(index);
                          setDeleted(!deleted)
                        }}
                        length={values.delivery_locations.length}
                        key={index}
                        errors={errors.delivery_locations && touched.delivery_locations ? errors.delivery_locations : undefined}
                      />
                    ))) : null}
                  <View style={tailwind('mb-3')}>
                    <AddNewButton
                      text="Add Another Delivery Location"
                      onPress={() => push({ name: '' })} />
                  </View>
                </View>
              )}
            </FieldArray>

            <View style={tailwind('flex flex-row flex-wrap')}>
              <RegularButton
                type="secondary"
                text="Cancel"
                operation={() => { navigation.navigate("PortList") }} />

              {
                docID
                  ?
                  <RegularButton
                    text="Update"
                    operation={() => { handleSubmit() }}
                    loading={loading && !isDelete} />
                  :
                  <RegularButton
                    text="Add"
                    operation={() => { handleSubmit() }}
                    loading={loading && !isDelete} />
              }



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
            </View>

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

      <StatusModal visible={modalVisible} message={`${isDelete ? 'Port Deleted' : docID ? 'Port Updated' : 'Port Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default PortFormScreen;
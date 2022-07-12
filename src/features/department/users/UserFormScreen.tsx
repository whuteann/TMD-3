import React, { useState } from 'react';
import { RootNavigationProps } from '../../../navigations/NavigationProps/NavigationProps';
import HeaderStack from '../../../components/atoms/display/HeaderStack';
import TextLabel from '../../../components/atoms/typography/TextLabel';
import { FieldArray, Formik } from 'formik';
import { revalidateCollection, useDocument } from '@nandorojo/swr-firestore';
import LoadingData from '../../../components/atoms/loading/loadingData';
import * as Yup from 'yup';
import { USERS } from '../../../constants/Firebase';
import { ROLES } from '../../../constants/Roles';
import { createUser, deleteUser, updateUser } from '../../../services/UserServices';
import StatusModal from '../../../components/atoms/modal/StatusModal';
import { User } from '../../../types/User';
import RegularButton from '../../../components/atoms/buttons/RegularButton';
import Body from '../../../components/atoms/display/Body';
import { useTailwind } from 'tailwind-rn/dist';
import FormTextInputField from '../../../components/molecules/input/FormTextInputField';
import FormDropdownInputField from '../../../components/molecules/input/FormDropdownInputField';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../../redux/reducers/Auth';
import AddNewButton from '../../../components/molecules/buttons/AddNewButton';
import ContactNumberInput from '../../../components/templates/departments/users/ContactNumberInput';
import { CREATE_USER } from '../../../permissions/Permissions';

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  role: Yup.string().oneOf(ROLES),
  email: Yup.string().email("Invalid email").required("Required"),
});

const UserFormScreen = ({ navigation, route }: RootNavigationProps<"CreateUser" | "EditUser">) => {
  const [deleted, setDeleted] = useState(false);
  const docID: any = route.params?.docID;
  const [error, setError] = useState("");
  const [isDelete, setDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = useSelector(UserSelector);

  const tailwind = useTailwind();

  const { data: user } = useDocument<User>(`${USERS}/${docID}`);

  const onSubmit = (values: any, resetForm) => {
    setLoading(true);

    if (docID) {
      return updateUser(docID, values, currentUser!, () => {
        setLoading(false);
        setModalVisible(true);
        revalidateCollection(USERS);
      }, (error) => {
        setLoading(false);
        setError(error);
      });
    }

    return createUser(values, currentUser!, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(USERS);
      resetForm();
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  const onCloseModal = () => {
    setModalVisible(false);
    navigation.navigate("Departments");
  }

  const handleDelete = () => {
    setDelete(true);
    setLoading(true);

    return deleteUser(docID, currentUser, () => {
      setLoading(false);
      setModalVisible(true);
      revalidateCollection(USERS);
    }, (error) => {
      setLoading(false);
      setError(error);
    });
  }

  if (!user) {
    return <LoadingData></LoadingData>
  }

  return (
    <Body header={<HeaderStack title={`${docID ? "Edit": "Create new"} employee profile`} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <Formik
        initialValues={{
          name: user?.name || '',
          role: user?.role || ROLES[0],
          email: user?.email || '',
          contacts: user?.contacts || [{ number: "", type: "Mobile" }],
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => onSubmit(values, resetForm)}
      >
        {({ errors, values, touched, setFieldValue, handleSubmit }) => (
          <View>
            <FormTextInputField
              label="Name"
              value={values.name}
              onChangeValue={text => setFieldValue("name", text)}
              required={true}
              hasError={errors.name && touched.name ? true : false}
              errorMessage={errors.name}
              editable={user?.id == currentUser?.id || currentUser?.permission?.includes(CREATE_USER) ? true : false} />

            <FormDropdownInputField
              label="Department/Position"
              value={values.role}
              items={ROLES}
              onChangeValue={text => setFieldValue("role", text)}
              required={true}
              hasError={errors.role && touched.role ? true : false}
              errorMessage={errors.role}
              editable={user?.id == currentUser?.id || currentUser?.permission?.includes(CREATE_USER) ? true : false} />

            <FormTextInputField
              label="Email"
              value={values.email}
              onChangeValue={text => setFieldValue("email", text)}
              required={true}
              hasError={errors.email && touched.email ? true : false}
              errorMessage={errors.email}
              editable={user?.id == currentUser?.id || currentUser?.permission?.includes(CREATE_USER) ? true : false} />

            <FieldArray name="contacts">
              {({ remove, push }) => (
                <View>
                  {values.contacts.length > 0 ? (
                    values.contacts.map((item, index) => (
                      <View key={index}>
                        <ContactNumberInput
                          handleChange={(val: Array<{ type: string, number: string }>) => { setFieldValue('contacts', val) }}
                          handleDelete={() => { remove(index); setDeleted(!deleted) }}
                          deleted={deleted}
                          index={index}
                          contacts={values.contacts}
                          listLength={values.contacts.length}
                          editable={user?.id == currentUser?.id || currentUser?.permission?.includes(CREATE_USER) ? true : false}
                        />
                      </View>
                    ))) : null}

                  {
                    user?.id == currentUser?.id || currentUser?.permission?.includes(CREATE_USER)
                      ?
                      <View style={tailwind("mb-5")}>
                        <AddNewButton text="Add Another Phone" onPress={() => push({ type: 'Mobile', number: "" })} />
                      </View>
                      :
                      <></>
                  }
                </View>
              )}
            </FieldArray>

            <RegularButton
              text={`${docID ? "Update" : "Next"}`}
              operation={() => { handleSubmit() }}
              loading={loading && !isDelete} />

            {
              docID && currentUser?.permission?.includes(CREATE_USER) && docID != currentUser.id
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
                <TextLabel content={error} color='text-red-500' />
            }
          </View>
        )}
      </Formik>

      <StatusModal visible={modalVisible} message={`${isDelete ? 'User Deleted' : docID ? 'User Updated' : 'User Created'}`} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  )
}

export default UserFormScreen;
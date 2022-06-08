import { Image, View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import { EmailIcon, LogoIcon } from "../../../assets/svg/SVG";
import Body from "../../components/atoms/display/Body";
import { AuthNavigationProps } from "../../navigations/NavigationProps/NavigationProps";
import Header from '../../components/atoms/typography/Header';
import { getWindow } from "../../helpers/GenericHelper";
import { Formik } from "formik";
import TextInputField from "../../components/atoms/input/text/TextInputField";
import RegularButton from "../../components/atoms/buttons/RegularButton";
import React, { useState } from 'react';
import TextLabel from "../../components/atoms/typography/TextLabel";
import LinkText from "../../components/molecules/typography/LinkText";
import * as Yup from "yup";
import { auth } from "../../functions/Firebase";
import StatusModal from "../../components/atoms/modal/StatusModal";

const formSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
});

const ForgetPasswordScreen = ({ navigation }: AuthNavigationProps<"ForgetPassword">) => {
  const tailwind = useTailwind();
  const { height } = getWindow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const onSubmit = (email: string) => {
    setLoading(true);
    auth.sendPasswordResetEmail(email)
      .then(() => {
        setModalVisible(true);
      })
      .catch((error) => {
        console.log(error.code);
        if (error.code == "auth/user-not-found") {
          setError("User does not exist");
        }
        switch (error.code) {
          case "auth/user-not-found":
            setError("User does not exist");
            break;
          default:
            setError(error.errorMessage)
            break;
        }

        setLoading(false);
      })
  }

  return (
    <Body variant='secondary' isFullScreen={true}>
      <View style={[
        tailwind('items-center flex flex-row justify-center w-full'),
        { 'height': height }  // This is not good as it blocks the screen from scrolling on app but no alternatives for now
      ]}>
        <View
          style={[
            tailwind('items-center justify-center w-full md:w-1/2 h-full'),
          ]}
        >

          <LogoIcon height={89} width={91} />

          <Header
            title='Enter your email'
            color='text-black'
            style={tailwind('mt-3')}
          />

          <Header
            title="to reset your password"
            color='text-black'
            style={tailwind('mb-2')}
          />

          <Formik
            initialValues={{
              email: '',
            }}
            onSubmit={values => { onSubmit(values.email); }}
            validationSchema={formSchema}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <View style={tailwind('items-center my-4 w-full md:w-3/5 lg:w-7/12')}>
                <TextInputField
                  icon={<EmailIcon width={22} height={22} />}
                  placeholder='Enter your e-mail'
                  onChangeText={handleChange('email')}
                  hasError={errors.email && touched.email ? true : false}
                  errorMessage={errors.email}
                  shadow={false} />

                <RegularButton
                  type='primary'
                  text='Reset Password'
                  operation={() => { handleSubmit() }}
                  loading={loading} />

                {
                  error == ""
                    ?
                    null
                    :
                    <TextLabel content={error ?? ''} color='text-red-500' />
                }
                <StatusModal visible={modalVisible} message={`Reset password email sent to ${values.email}`} onClose={() => { setLoading(false); navigation.navigate("Login"); setModalVisible(false) }}></StatusModal>
              </View>
            )}
          </Formik>

          <LinkText
            content='Back to login page'
            to={() => navigation.navigate("Login")}
            color='text-primary'
          />
        </View>

        <View style={tailwind('hidden md:block w-1/2 h-full')}>
          <Image style={tailwind('h-full w-full')} source={require("../../../assets/images/login-page-image.jpg")} />
        </View>
      </View>

    </Body>
  )
}

export default ForgetPasswordScreen;

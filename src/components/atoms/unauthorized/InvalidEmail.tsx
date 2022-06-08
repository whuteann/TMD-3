import React, { useState } from "react";
import TextLabel from "../typography/TextLabel";
import { useTailwind } from "tailwind-rn/dist";
import { View } from "react-native";
import LinkText from "../../molecules/typography/LinkText";
import { resendVerification } from "../../../services/UserServices";
import { useSelector } from "react-redux";
import { UserSelector } from "../../../redux/reducers/Auth";
import Body from "../display/Body";
import HeaderStack from "../display/HeaderStack";
import { RootNavigationProps } from "../../../navigations/NavigationProps/NavigationProps";
import StatusModal from "../modal/StatusModal";
import RegularButton from "../buttons/RegularButton";
import Header from "../typography/Header";
import StrangerStack from "../display/StrangerStack";

const InvalidEmail= ({ navigation, route }: RootNavigationProps<"InvalidEmail">) => {
  const user = useSelector(UserSelector);
  const tailwind = useTailwind();

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resendEmail = () => {
    setLoading(true);

    resendVerification(user!, () => {
      setMessage('Email Verification sent');
      setModalVisible(true);
      setLoading(false);
    }, (err) => {
      setMessage(err);
      setModalVisible(true);
      setLoading(false);
    });
  }
  
  const onCloseModal = () => {
    setModalVisible(false);
  }

  return (
    <Body header={<StrangerStack title={"Invalid Email"} navigateProp={navigation} />} style={tailwind("mt-6")}>
      <View style={tailwind("bg-cream w-full h-full z-10 items-center")}>
        <View style={tailwind("justify-end flex-col mt-[300px]")}>
          <View style={tailwind("mt-[30px]")}>
            <Header 
              title="Your email hasn't been verified" 
              color="text-black" />
            
            <View style={ tailwind('my-2') }></View>

            <RegularButton
              text="Resend"
              operation={() => { resendEmail() }}
              loading={loading} />
          </View>
        </View>
      </View>
      <StatusModal visible={modalVisible} message={message} onClose={() => onCloseModal()}></StatusModal>
    </Body>
  );
};

export default InvalidEmail;
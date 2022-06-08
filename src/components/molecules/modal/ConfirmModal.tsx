import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Modal } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import RegularButton from '../../atoms/buttons/RegularButton';
import TextLabel from '../../atoms/typography/TextLabel';

interface ModalProps {
  text1: string,
  image: any,
  visible: boolean,
  button1Text: string,
  nextAction: () => void,
  setModalClose: () => void,

  horizontalButtons?: boolean,
  downloadButton?: boolean,
  button2Text?: string,
  text2?: string,
  cancelAction?: () => void,
  downloadText?: string,
  onDownload?: () => void,

}

const ConfirmModal: React.FC<ModalProps> = ({
  text1, text2, button1Text, button2Text, visible, setModalClose, nextAction, image, downloadText,
  onDownload = () => { },
  horizontalButtons = false,
  cancelAction = () => { },
  downloadButton = false
}) => {
  let buttons;
  const tailwind = useTailwind();

  const cancelButtonPress = () => {
    cancelAction();
    setModalClose();
  }

  const nextButtonPress = () => {
    nextAction();
    setModalClose();
  }

  if (horizontalButtons) {
    buttons = (
      <View style={tailwind("flex-row flex justify-around mt-6 ml-2 items-center")}>
        <View style={Platform.OS != "web" ? tailwind("mr-3 w-5/12") : tailwind("mr-3 w-10/12")}>
          {button2Text ? (<RegularButton type="secondary" text={button2Text} operation={cancelButtonPress} />) : null}
        </View>
        <View style={Platform.OS != "web" ? tailwind("mr-3 w-5/12") : tailwind("w-10/12")}>
          <RegularButton type="primary" text={button1Text} operation={nextButtonPress} />
        </View>
      </View>
    );
  } else {
    buttons = (
      <View style={tailwind("w-full")}>
        <View style={tailwind("mt-6")}>
          <RegularButton text={button1Text} operation={nextButtonPress} />
        </View>
        {button2Text ? (<RegularButton text={button2Text} operation={cancelButtonPress} type="secondary" />) : null}
        {downloadButton ? (
          <TouchableOpacity onPress={() => { setModalClose(); onDownload(); }}>
            <View style={tailwind("items-center")}>
              <TextLabel content={"" + downloadText} color={"text-primary"} style={tailwind("text-center")} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <TouchableOpacity
        style={tailwind("bg-gray-faded h-full justify-center items-center")}
        activeOpacity={1}
        onPressOut={() => { setModalClose() }}
      >
        <View style={[styles.boxWithShadow, Platform.OS != "web" ? tailwind("items-center bg-cream w-9/12 p-5") : tailwind("items-center bg-cream  w-[88%] sm:w-[75%] md:w-[45%] lg:w-[30%]  xl:w-[25%] p-5")]} >
          {image}
          <TextLabel content={text1} alignment={"text-center"} style={tailwind("font-bold")} />
          {
            text2
              ?
              <TextLabel content={`${text2}`} alignment={"text-center"} style={tailwind("font-bold")} />
              :
              null
          }
          {buttons}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  boxWithShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 10,
  }
});

export default ConfirmModal;
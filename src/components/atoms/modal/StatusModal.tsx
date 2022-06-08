import React from "react";
import { Modal, Platform, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { TickIcon } from "../../../../assets/svg/SVG";
import RegularButton from "../buttons/RegularButton";
import TextLabel from "../typography/TextLabel";

interface StatusModalProps {
  visible: boolean,
  message: string,
  buttonText?: string
  icon?: any,
  onClose: () => void
}

const StatusModal = (props: StatusModalProps) => {
  const {
    visible,
    message,
    buttonText = 'OK',
    icon,
    onClose

  } = props;
  const tailwind = useTailwind();
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          onClose();
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, tailwind(`${Platform.OS == "web" ? "" : "w-[70%]"}`)]}>
            {
              icon
                ?
                icon
                :
                <TickIcon width={70} height={70}></TickIcon>
            }
            <View style={tailwind('my-2 w-full')}>
              <TextLabel
                content={message}
                style={tailwind("font-bold text-center")}
              />
            </View>
            <View style={tailwind("w-[70%]")}>
              <RegularButton text={buttonText} operation={() => { onClose() }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default StatusModal;
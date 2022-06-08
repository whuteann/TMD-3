import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import * as DocumentPicker from 'expo-document-picker';
import ConfirmModal from '../modal/ConfirmModal';
import { TickIcon, UploadIcon } from '../../../../assets/svg/SVG';
import TextLabel from '../../atoms/typography/TextLabel';


interface ButtonProps {
  buttonText?: string,
  hasError?: boolean,
  errorMessage?: string,
  onSuccess?: (uri: string) => void,
}

const UploadFileButton: React.FC<ButtonProps> = (({
  buttonText = "Upload File",
  hasError = false,
  errorMessage = "",
  onSuccess = () => { }
}) => {
  const tailwind = useTailwind();
  const [text, setText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uri, setUri] = useState("");
  const [errorInternal, setErrorInternal] = useState("");


  const doSomethingWithFile = async () => {
    fetch(uri).then(res => {
      if (Platform.OS == "web") {
        onSuccess(res.url);
      } else {
        res.blob().then(blob => {
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            var base64data = reader.result;

            onSuccess(`${base64data}`)
          }
        })
      }
    }).catch(err => {
      console.log(err);
    });
  }

  async function SelectFile() {

    try {
      //ignore this error until it crashes or something; it crashes for mobile
      await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: false,
      }).then((value) => {
        if (value["type"] == "success") {
          setText(`${value['name']}`);
          setUri(`${value['uri']}`);
          setModalOpen(true);
        }
      }
      )


    } catch (err) {
      throw err
    }
  }

  let modal;

  modal = (
    <ConfirmModal
      downloadButton={false}
      text1={`Uploaded file “${text}”`}
      text2="" image={<TickIcon height={100} width={100} />}
      button1Text="Save"
      button2Text="Cancel"
      horizontalButtons={true}
      visible={modalOpen}
      cancelAction={() => { }}
      setModalClose={() => { setModalOpen(false) }}
      nextAction={() => {
        doSomethingWithFile();
      }}
    />
  )

  return (
    <View style={tailwind("items-start mb-5 w-full")}>
      {modal}
      <TouchableOpacity
        onPress={() => SelectFile()}
      >
        <View>
          <View style={tailwind("flex flex-row")}>
            <UploadIcon width={27} height={27} />
            <View style={tailwind("ml-4")} />
            <TextLabel content={buttonText} style={tailwind("font-bold text-primary w-full")} />
          </View>
        </View>
      </TouchableOpacity>
      {
        hasError
          ?
          <TextLabel content={errorMessage ?? ""} color='text-red-500' />
          :
          <></>
      }
      {
        errorInternal
          ?
          <TextLabel content={errorInternal ?? ""} color='text-red-500' />
          :
          <></>
      }
    </View>
  )
})

export default UploadFileButton;
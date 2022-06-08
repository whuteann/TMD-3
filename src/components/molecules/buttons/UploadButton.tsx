import React, { useEffect, useState } from 'react';
import { Linking, Platform, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import * as DocumentPicker from 'expo-document-picker';
import ConfirmModal from '../modal/ConfirmModal';
import { OrangeXIcon, TickIcon } from '../../../../assets/svg/SVG';
import TextLabel from '../../atoms/typography/TextLabel';
import { functions, storageRef } from '../../../functions/Firebase';
import { UploadFileAndroid, UploadFileWeb } from '../../../services/StorageServices';


interface ButtonProps {
  buttonText: string,
  value: string | undefined,
  path?: string,
  hasError?: boolean,
  errorMessage?: string,
  autoSave?: boolean,
  filename_storage?: string,
  onDelete?: () => void,
  setUploaded?: (uploaded: boolean) => void,
  updateDoc?: (filename: string, filename_storage: string) => void,
  setSelectedFile?: (file: { filename: string, uri: string, file: File | undefined }) => void,
}

const UploadButton: React.FC<ButtonProps> = (({
  buttonText,
  path = "default",
  value,
  filename_storage,
  hasError = false,
  errorMessage = "",
  autoSave = true,
  onDelete = () => { },
  updateDoc = (filename, filename_storage) => { },
  setUploaded = () => { },
  setSelectedFile = () => { }
}) => {
  const tailwind = useTailwind();
  const [text, setText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uri, setUri] = useState("");
  const [uploaded, setUploadedFile] = useState(false);
  const [file, setFile] = useState<any>();
  const [downloadUrl, setDownloadUrl] = useState("");
  const [errorInternal, setErrorInternal] = useState("");

  useEffect(() => {
    if (value) {
      if (autoSave) {
        storageRef
          .child(`${path}/${filename_storage}`)
          .getDownloadURL()
          .then(url => {
            setDownloadUrl(url);
          });
      }
      setText(value);
      setUploadedFile(true);
      setUploaded(true);
    } else {
      setUploaded(false);
      setUploadedFile(false);
    }
  }, [value, filename_storage]);


  const UploadFile = async () => {
    return new Promise(async (resolve, reject) => {
      if (Platform.OS == "web") {
        UploadFileWeb({ name: file.name, file: file.file }, path).then((data) => {
          const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
          setDownloadUrl(`${url}`);
          updateDoc(filename, filename_storage);
          setUploaded(true);
        }).catch(err => {
          setFile(undefined);
          setText("");
          setUri("");
          setUploadedFile(false);
          setErrorInternal(err);
        })
      } else {
        UploadFileAndroid({ name: file.name, file: file.file, uri: uri }, path).then(data => {
          const { url, filename, filename_storage } = data as { url: string, filename: string, filename_storage: string };
          setDownloadUrl(`${url}`);
          updateDoc(filename, filename_storage);
          setUploaded(true);
        }).catch(err => {

          setFile(undefined);
          setText("");
          setUri("");
          setUploadedFile(false);
          setErrorInternal(err);
        })
      }
    })
  }

  const deleteFile = () => {
    onDelete();
    if (autoSave || filename_storage) {
      storageRef
        .child(`${path}/${filename_storage}`)
        .delete()
        .then(() => {
        }).catch(error => console.log("error deleting file: ", error))
    }
    setFile(undefined);
    setUploadedFile(false);
    setSelectedFile({ filename: "", uri: "", file: undefined })
    updateDoc("", "");
    setUploaded(false);
  }

  async function SelectFile() {
    try {
      //ignore this error until it crashes or something; it crashes for mobile
      await DocumentPicker.getDocumentAsync({
        // type: ["application/pdf", "image/png", "image/jpeg"]
        type: "application/pdf",
        copyToCacheDirectory: false,
      }).then((value) => {
        if (value["type"] == "success") {

          setFile(value);
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
        setUploadedFile(true);
        autoSave ? UploadFile() : setSelectedFile({ filename: file.name, uri: uri, file: file.file });;
      }}
    />
  )

  return (
    <View style={tailwind("items-center mb-5")}>
      {modal}
      {uploaded ? (
        <View style={tailwind('w-full py-1 rounded-lg border border-primary flex-row justify-center items-center')}>
          <View style={tailwind("w-10/12")}>
            <TouchableOpacity
              onPress={() => {
                if (autoSave) {
                  if (Platform.OS == 'web') {
                    window.open(downloadUrl, '_blank');
                  } else {
                    Linking.openURL(downloadUrl)
                      .catch(
                        (err) => console.error('An error occurred', err)
                      );
                  }
                }
              }}>
              <TextLabel content={`${text}`} style={[tailwind("pl-5 font-bold text-primary underline")]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { deleteFile() }}>
            <View style={tailwind("pr-10")}>
              <View style={tailwind("ml-4 mt-1")}>
                <OrangeXIcon width={20} height={20} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={tailwind('w-full')}
          onPress={() => SelectFile()}
        >
          <View style={tailwind('w-full py-1 rounded-lg border border-primary h-10 flex-row justify-center')}>
            <View style={tailwind("items-center")}>
              <TextLabel content={buttonText} style={tailwind("font-bold text-primary w-full")} />
            </View>
          </View>
        </TouchableOpacity>
      )}
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

export default UploadButton;
import { Linking, Platform } from "react-native";
import { storageRef } from "../functions/Firebase";

export const openDocument = (path: string, filename: string) => {

  storageRef
    .child(`${path}/${filename}`)
    .getDownloadURL()
    .then(url => {
      if (Platform.OS == 'web') {
        window.open(url, '_blank');
      } else {
        Linking.openURL(url)
          .catch(
            (err) => console.error('An error occurred', err)
          );
      }
    });
}

export const UploadFile = async (path: string, file: any, fileName: string, uri: string, nextAction: (filename: string) => void) => {
  let current = new Date;
  let currentTime = current.toUTCString();

  let filename = `${path}/${fileName}.${currentTime}`;
  let imageRef = storageRef.child(filename);


  if (Platform.OS == "web") {
    imageRef.put(file).on(
      "state_changed",
      error => {
        console.error(error, "here");
      },
      () => {

        nextAction(filename);
      })
  } else {
    const completeUri = `${uri}`;
    const response = await fetch(completeUri);
    const blob = await response.blob();
    imageRef.put(blob).on(
      "state_changed",
      error => {
        console.error(error, "here");
      },
      () => {
        nextAction(filename);
      })
  }

  return `${fileName}.${currentTime}`;
}

export const UploadeFileWithCompleteFilename = async (path: string, file: any, fullFilename, uri: string, nextAction: () => void, onError: (error) => void) => {
  let imageRef = storageRef.child(`${path}/${fullFilename}`);

  if (Platform.OS == "web") {
    imageRef.put(file).on(
      "state_changed",
      error => {
        onError(error);
      },
      () => {
        nextAction();
      })
  } else {
    const completeUri = `${uri}`;
    const response = await fetch(completeUri);
    const blob = await response.blob();
    imageRef.put(blob).on(
      "state_changed",
      error => {
        onError(error);
      },
      () => {
        nextAction();
      })
  }

}

export const UploadBatch = async (path: string, files: Array<{ file: File, filename_storage: string, uri: string }>) => {

  const Uploads = files.map(async (item) => {
    const { file, filename_storage, uri } = item;

    return await UploadeFileWithCompleteFilename(
      path,
      file,
      filename_storage,
      uri,
      () => {
      }, (error) => {
      }
    )
  })

  const resolve = await Promise.all(Uploads).catch(err => console.error(err));
}

export const deleteFile = (path: string, filename_storage: string, onSuccess: () => void) => {
  storageRef
    .child(`${path}/${filename_storage}`)
    .delete()
    .then(() => {
      onSuccess();
    }).catch(error => console.error("error deleting file: ", error))

}

export const UploadFileWeb = (file: { name: string, file: File }, path: string) => {
  return new Promise((resolve, reject) => {
    let current = new Date;
    let currentTime = current.toUTCString();
    let filename = `${path}/${file.name}.${currentTime}`;
    let imageRef = storageRef.child(filename)

    imageRef.put(file.file).then(() => {
      storageRef
        .child(filename)
        .getDownloadURL()
        .then(url => {
          resolve({ filename: file.name, filename_storage: `${file.name}.${currentTime}`, url: url });
        });
    }).catch(() => {
      reject("Network Failed")
    })
  })
}

export const UploadFileAndroid = (file: { name: string, file: File, uri: string }, path: string) => {


  return new Promise(async (resolve, reject) => {

    let current = new Date;
    let currentTime = current.toUTCString();
    let filename = `${path}/${file.name}.${currentTime}`;
    let imageRef = storageRef.child(filename)

    var request = new Request(`${file.uri}`);


    fetch(request, {
      headers: {
        'Content-Type': 'application/pdf',
        'Accept': 'application/pdf'
      }
    }).then(response => {
      response.blob().then(blob => {

        imageRef.put(blob).then(() => {
          storageRef
            .child(filename)
            .getDownloadURL()
            .then(url => {
              resolve({ filename: file.name, filename_storage: `${file.name}.${currentTime}`, url: url });
            });
        }).catch(() => {
          console.error("error 1");
          reject("Network Failed")
        })
      }).catch(err => {
        console.error("error 2");
        reject(err.message);
      })

    }).catch(err => {
      console.error("error 3");
      console.error(err.name);

      reject(err.message)
    })

  })
}

export const UploadFileAndroidCompleteFilename = async (path: string, file: any, fullFilename, uri: string) => {


  return new Promise(async (resolve, reject) => {

    let current = new Date;
    let currentTime = current.toUTCString();
    let filename = `${path}/${fullFilename}`;
    let imageRef = storageRef.child(filename)

    var request = new Request(`${uri}`);


    fetch(request, {
      headers: {
        'Content-Type': 'application/pdf',
        'Accept': 'application/pdf'
      }
    }).then(response => {
      response.blob().then(blob => {

        imageRef.put(blob).then(() => {
          storageRef
            .child(filename)
            .getDownloadURL()
            .then(url => {
              resolve({ filename: file.name, filename_storage: `${file.name}.${currentTime}`, url: url });
            });
        }).catch(() => {
          console.error("error 1");
          reject("Network Failed")
        })
      }).catch(err => {
        console.error("error 2");
        reject(err.message);
      })

    }).catch(err => {
      console.error("error 3");
      console.error(err);

      reject(err.message)
    })

  })
}
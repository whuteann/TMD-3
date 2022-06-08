import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";

export const createAndDisplayPDF = async (html) => {
  try {
    if(Platform.OS == 'web') {
      handleWeb(html);
    } else if(Platform.OS == 'android') {
      const { uri } = await Print.printToFileAsync({ html });
      const completeUri = `file://${uri}`;

      try {
        FileSystem.getContentUriAsync(completeUri).then(cUri => {
          IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: cUri,
            flags: 1,
            type: "application/pdf",
          });
        });
  
      } catch (e) {
        console.log(e);
      }
    } else {
      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri);
    }
  } catch (err) {
    console.error(err);
  }
}

const handleWeb = (html) => {
  const pW: any = window.open('', '', 'height=500, width=500');
  let isChrome = Boolean(pW?.chrome);

  pW?.document.write(html);
  pW?.document.close();

  pW.moveTo(0, 0);
  pW.resizeTo(screen.width, screen.height);
  setTimeout(function() {
      pW.print();
      pW.close();
  }, 250);

  // if(isChrome) {
  //   pW.onload = function() { // wait until all resources loaded 
  //     pW.focus(); // necessary for IE >= 10
  //     pW.print();  // change window to mywindow
  //   //   pW.close();// change window to mywindow
  //   };
  // } else {
  //   // pW.document.close(); // necessary for IE >= 10
  //   pW.focus(); // necessary for IE >= 10
  //   pW.print();
  //   // pW.close();
  // }
}

let image = require('../../assets/images/icon.png');
let src;

const copyFromAssets = async () => {
  try {
    await Asset.loadAsync(image);
    const { localUri } = Asset.fromModule(image);

    return localUri;
  } catch (error) {
    throw error;
  }
}

export const loadPDFLogo = async () => {
  if (Platform.OS != 'web') {
    src = await copyFromAssets();
    src = await FileSystem.readAsStringAsync(src, {encoding: 'base64'});
    
    return `data:image/png;base64,${src}`;
  } 

  return image;
}
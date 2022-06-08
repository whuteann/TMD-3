import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as WebBrowser from 'expo-web-browser';

export async function displayPDF(uri: string) {

  const completeUri = `file://${uri}`;

  if (Platform.OS == "android") {
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
    await WebBrowser.openBrowserAsync(completeUri);
    return "Poggerrs";
  }

}

export const createPDF = async (html) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    displayPDF(uri);
    return uri;
  } catch (err) {
    console.error(err);
  }
}
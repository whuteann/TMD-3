import React from 'react'; import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../typography/TextLabel';
import TextInputField from './text/TextInputField';

interface InfoProps {
  placeholder: string,
  value?: string,
  style?: any,
  onChangeText?: (text: any) => void,
  hasError?: boolean,
  errorMessage?: string,
}

const InfoInput: React.FC<InfoProps> = ({
  placeholder, style, onChangeText = () => { }, value = undefined, hasError = false, errorMessage = ""
}) => {

  const tailwind = useTailwind();
  let display;

  display = (
    <View style={tailwind("flex-row w-[45%]")}>
      <TextLabel content={`:`} style={[tailwind("w-auto mr-3")]} />
      <TextInputField
        placeholder=''
        value={value}
        style={tailwind("h-6")}
        onChangeText={onChangeText}
        hasError={hasError}
        errorMessage={errorMessage}
      />
    </View>
  );

  return (
    <View>
      <View style={tailwind("flex-row mb-1")}>
        <View style={[tailwind("w-6/12"), style]} >
          <View>
            <TextLabel content={placeholder} />
          </View>
        </View>
        {display}
      </View>
    </View>
  )
}


export default InfoInput;
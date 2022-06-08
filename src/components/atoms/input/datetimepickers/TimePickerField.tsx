import React, { useState, useCallback, useEffect } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { ArrowDownIcon } from '../../../../../assets/svg/SVG';
import { TimePickerModal } from 'react-native-paper-dates';
import moment from 'moment';
import TextLabel from '../../typography/TextLabel';

interface timeProps {
  value?: string,
  editable?: boolean,
  onChangeText?: (text: any) => void,
  placeholder?: string,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean
}

const TimePickerField: React.FC<timeProps> = ({
  value,
  editable = true,
  onChangeText = () => { },
  placeholder = 'Select time',
  hasError = false,
  errorMessage = '',
  style,
  shadow = true,
}) => {
  const tailwind = useTailwind();
  const [time, setTime] = useState<string | undefined>(undefined);  
  const [visible, setVisible] = React.useState(false)

  useEffect(() => {
    if(value) {
      let existingTime = moment(value, 'hh::mm');
      setTime(existingTime.format('hh:mm a'));
    } 
  }, []);

  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const onConfirm = React.useCallback(
    ({ hours, minutes,  }) => {
      setVisible(false);
      let existingTime = moment(`${hours}:${minutes}`, 'HH:mm');
      setTime(existingTime.format('hh:mm a'));
      onChangeText(existingTime.format('hh:mm a'));
    },
    [setVisible]
  );

  return (
    <View style={tailwind('mb-5')}>
      <View style={tailwind('w-full')}>
        <View style={[
          tailwind(`flex flex-row ${ shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary' } items-center bg-white rounded-md pl-3 py-4`),
          hasError ? tailwind('border border-red-500') : null,
          style,
        ]}>
          <TouchableWithoutFeedback onPress={() => setVisible(true)}>
            <View style={tailwind('flex flex-row w-full')}>
              {
                time 
                  ?
                  <Text style={tailwind("text-black text-16px")}>{ time }</Text>
                  :
                  <Text style={tailwind("text-gray-primary text-16px")}>{ placeholder }</Text>
              }

              <View style={tailwind("flex-1 items-end flex-col justify-center pr-2")}>
                <ArrowDownIcon height={20} width={20} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
      
      <TimePickerModal
        locale="en"
        visible={visible}
        onDismiss={ onDismiss }
        onConfirm={ onConfirm }
      />

      {
        hasError
          ?
          <TextLabel content={errorMessage ?? ''} color='text-red-500' />
          :
          <></>
      }
    </View>
  );
}

export default TimePickerField;
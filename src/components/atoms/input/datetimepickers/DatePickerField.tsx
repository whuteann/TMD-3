import React, { useState, useCallback, useEffect } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { ArrowDownIcon } from '../../../../../assets/svg/SVG';
import { DatePickerModal } from 'react-native-paper-dates';
import moment from 'moment';
import TextLabel from '../../typography/TextLabel';

interface dateProps {
  value?: string,
  editable?: boolean,
  onChangeText?: (text: any) => void,
  placeholder?: string,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean
}

const DatePickerField: React.FC<dateProps> = ({
  value,
  onChangeText = () => { },
  placeholder = 'Select date',
  hasError = false,
  errorMessage = '',
  style,
  shadow = true,
}) => {
  const tailwind = useTailwind();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      let existingDate = moment(value, 'DD/MM/YYYY');
      setDate(existingDate.toDate());
    }
  }, []);

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    (params) => {
      let datePicked: Date = params.date;
      setOpen(false);
      setDate(datePicked);

      datePicked
        ?
        onChangeText(`${datePicked.getDate()}/${datePicked.getMonth() + 1}/${datePicked.getFullYear()}`)
        :
        onChangeText("")

    },
    [setOpen, setDate]
  );

  return (
    <View style={tailwind('mb-5')}>
      <View style={tailwind('w-full')}>
        <View style={[
          tailwind(`flex flex-row ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} items-center bg-white rounded-md pl-3 py-4`),
          hasError ? tailwind('border border-red-500') : null,
          style,
        ]}>
          <TouchableWithoutFeedback onPress={() => setOpen(true)}>
            <View style={tailwind('flex flex-row w-full')}>
              {
                date
                  ?
                  <Text style={tailwind("text-black text-16px")}>{`${date?.getDate()}/${date?.getMonth() + 1}/${date?.getFullYear()}`}</Text>
                  :
                  <Text style={tailwind("text-gray-primary text-16px")}>{placeholder}</Text>
              }

              <View style={tailwind("flex-1 items-end flex-col justify-center pr-2")}>
                <ArrowDownIcon height={20} width={20} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={date}
        onConfirm={onConfirmSingle} />

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

export default DatePickerField;
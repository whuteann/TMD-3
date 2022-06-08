import React, { useState, useCallback, useEffect } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { ArrowDownIcon } from '../../../../../assets/svg/SVG';
import { DatePickerModal } from 'react-native-paper-dates';
import moment from 'moment';
import TextLabel from '../../typography/TextLabel';

interface dateProps {
  value?: { startDate: string, endDate: string },
  editable?: boolean,
  onChangeText?: (text: any) => void,
  placeholder?: string,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean
}

const RangeDatePickerField: React.FC<dateProps> = ({
  value,
  onChangeText = () => { },
  placeholder = 'Select date',
  hasError = false,
  errorMessage = '',
  style,
  shadow = true,
}) => {
  const tailwind = useTailwind();
  const [range, setRange] = React.useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({ startDate: undefined, endDate: undefined });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value?.startDate || value?.endDate) {
      let existingStartDate = moment(value.startDate, 'DD/MM/YYYY');
      let existingEndDate = moment(value.endDate, 'DD/MM/YYYY');
      setRange({ startDate: existingStartDate.toDate(), endDate: existingEndDate.toDate() });
    }
  }, []);

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    ({ startDate, endDate }) => {
      let datePicked: {
        startDate: Date | undefined;
        endDate: Date | undefined;
      } = { startDate, endDate };
      setOpen(false);
      setRange(datePicked);

      datePicked
        ?
        onChangeText({
          startDate: datePicked.startDate ? `${datePicked.startDate.getDate()}/${(datePicked.startDate.getMonth() || 0) + 1}/${datePicked.startDate.getFullYear()}` : undefined,
          endDate: datePicked.endDate ? `${datePicked.endDate.getDate()}/${(datePicked.endDate.getMonth() || 0) + 1}/${datePicked.endDate.getFullYear()}` : undefined
        })
        :
        onChangeText("")

    },
    [setOpen, setRange]
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
                range.startDate || range.endDate
                  ?
                  <Text style={tailwind("text-black text-16px")}>{`${range.startDate?.getDate()}/${(range.startDate?.getMonth() || 0) + 1}/${range.startDate?.getFullYear()} to ${range.endDate ? `${range.endDate?.getDate()}/${(range.endDate?.getMonth() || 0) + 1}/${range.endDate?.getFullYear()}` : "Not Selected"} `}</Text>
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
        mode="range"
        visible={open}
        onDismiss={onDismissSingle}
        startDate={range.startDate}
        endDate={range.endDate}
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

export default RangeDatePickerField;
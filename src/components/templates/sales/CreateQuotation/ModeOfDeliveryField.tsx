
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import FormLabel from '../../../molecules/typography/FormLabel';

interface InputProps {
  index: number,
  delivery_modes: Array<string>,
  errors: any,
  deleted: boolean,
  length: number,
  onDelete: () => void
}

const ModeOfDeliveryField: React.FC<InputProps> = ({
  delivery_modes, index, errors, deleted, length, onDelete
}) => {
  const [updated, setUpdated] = useState(false);
  const [modeOfDeliveryLocal, setModeOfDeliveryLocal] = useState<Array<string>>(delivery_modes);
  const tailwind = useTailwind();
  const updateList = (values: any) => {
    let newList = modeOfDeliveryLocal
    newList[index] = values;
    setModeOfDeliveryLocal([...newList]);
  }

  useEffect(() => {
    setModeOfDeliveryLocal(delivery_modes);
    setUpdated(!updated);
  }, [modeOfDeliveryLocal, deleted]);


  const [modeOfDeliveryErrors, setModeOfDeliveryErrors] = useState();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setModeOfDeliveryErrors(errors[index]);
      } else {
        setModeOfDeliveryErrors(undefined);
      }
    } else {
      setModeOfDeliveryErrors(undefined);
    }
  }, [errors])

  return (
    <View>
      <View style={tailwind("flex-row")}>
        <View style={tailwind("w-1/5")}>
          <FormLabel text={`Mode of Delivery ${index + 1}`} required={true} />
        </View>
        {
          length > 1
            ?
            (
              <View style={tailwind("items-end flex-grow mt-[6px]")}>
                <TouchableOpacity onPress={() => { onDelete() }}>
                  <TrashIcon height={15} width={15} />
                </TouchableOpacity>
              </View>
            )
            :
            null
        }
      </View>
      <DropdownField
        shadow={true}
        value={modeOfDeliveryLocal[index]}
        items={["Ship to Ship Transfer", "Lorry Tanker", "Ex Pipe Line"]}
        onChangeValue={(val) => { updateList(val) }}
        hasError={modeOfDeliveryErrors ? true : false}
        errorMessage={modeOfDeliveryErrors}
      />
    </View>
  )
}

export default ModeOfDeliveryField;
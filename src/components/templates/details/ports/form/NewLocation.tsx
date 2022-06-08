import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../../assets/svg/SVG';
import TextLabel from '../../../../atoms/typography/TextLabel';
import FormTextInputField from '../../../../molecules/input/FormTextInputField';
import { deliveryLocation } from '../../../../../types/Port';

interface sectionProps {
  delivery_locations: Array<deliveryLocation>,
  index: number,
  deleted: boolean,
  handleDelete: () => void,
  length: number,
  errors?: any,
}

const NewLocation: React.FC<sectionProps> = ({
  index,
  delivery_locations,
  handleDelete,
  length,
  errors
}) => {
  const [localList, setLocalList] = useState(delivery_locations);
  const tailwind = useTailwind();

  const [deliveryLocationErrors, setDeliveryLocationErrors] = useState<{ name: string }>();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setDeliveryLocationErrors(errors[index]);
      } else {
        setDeliveryLocationErrors(undefined);
      }
    } else {
      setDeliveryLocationErrors(undefined);
    }
  }, [errors])

  const updateList = (value: string) => {
    let newList = localList;
    
    newList[index].name = value;
    setLocalList([...newList]);
  }

  return (
    <View>
      <View style={tailwind('flex flex-row items-center')}>
        <TextLabel content={`Delivery Location ${index + 1}`} style={tailwind('font-bold text-16px underline')} />

        {
          length > 1
            ?
            (
              <TouchableOpacity onPress={() => { handleDelete() }}>
                <TrashIcon width={15} height={15} />
              </TouchableOpacity>
            )
            :
            null
        }
      </View>

      <FormTextInputField
        label="Name"
        value={delivery_locations[index].name}
        onChangeValue={text => { updateList(text)}}
        required={true}
        hasError={Object.keys(deliveryLocationErrors || {}).includes("name")}
        errorMessage={deliveryLocationErrors ? deliveryLocationErrors.name : ""}
      />
    </View>
  )
}

export default NewLocation;
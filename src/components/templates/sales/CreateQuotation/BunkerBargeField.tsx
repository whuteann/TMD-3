import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import FormLabel from '../../../molecules/typography/FormLabel';

interface InputProps {
  index: number,
  bunkers: Array<string>,
  bunkerList,
  errors: any,
  deleted: boolean,
  length: number,
  onDelete: () => void
}

const BunkerBargeField: React.FC<InputProps> = ({
  bunkers, bunkerList, index, errors, deleted, length, onDelete
}) => {
  const [updated, setUpdated] = useState(false);
  const [bunkersLocal, setBunkersLocal] = useState<Array<string>>(bunkers);
  const tailwind = useTailwind();
  const updateList = (values: any) => {
    let newList = bunkersLocal
    newList[index] = values;
    setBunkersLocal([...newList]);
  }

  useEffect(() => {
    setBunkersLocal(bunkers);
    setUpdated(!updated);
  }, [bunkersLocal, deleted]);


  const [bunkerErrors, setBunkerErrors] = useState();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setBunkerErrors(errors[index]);
      } else {
        setBunkerErrors(undefined);
      }
    } else {
      setBunkerErrors(undefined);
    }
  }, [errors])

  return (
    <View>
      <View style={tailwind("flex-row")}>
        <View style={tailwind("w-1/5")}>
          <FormLabel text={`Bunker Barge ${index + 1}`} required={true} />
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
        value={bunkersLocal[index]}
        items={bunkerList}
        onChangeValue={(val) => { updateList(val) }}
        hasError={bunkerErrors ? true : false}
        errorMessage={bunkerErrors}
      />
    </View>
  )
}

export default BunkerBargeField;
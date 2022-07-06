import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import { LITRE, UNITS_LIST_SINGULAR } from '../../../../constants/Units';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import TextInputField from '../../../atoms/input/text/TextInputField';
import TextLabel from '../../../atoms/typography/TextLabel';
import AddNewButton from '../../../molecules/buttons/AddNewButton';
import FormLabel from '../../../molecules/typography/FormLabel';

type price = {
  value: any,
  unit: string,
  remarks: string
}

interface inputProps {
  prices: Array<price>,
  name: string,
  index: number,
  errors: any,
}

const PricesField: React.FC<inputProps> = ({
  prices, name, index, errors
}) => {
  const tailwind = useTailwind();
  const [localList, setLocalList] = useState<Array<price>>(prices);
  const [triggerUpdate, setTriggerUpdate] = useState(false);
  const [priceErrors, setPriceErrors] = useState([{ value: "", unit: "" }]);
  
  const updateValue = (field: "unit" | "value" | "remarks", val: string, index: number) => {
    let newList = localList;
    switch (field) {
      case "value":
        newList[index].value = val;
        break;
      case "unit":
        newList[index].unit = val;
        break;
      case "remarks":
        newList[index].remarks = val;
        break;
    }
    setLocalList([...newList])
  }

  useEffect(() => {
    setLocalList(prices);
  }, [triggerUpdate])

  useEffect(() => {
    if (errors) {
      setPriceErrors(errors.prices);
    } else {
      setPriceErrors([]);
    }
  }, [errors])

  return (
    <View>
      <View>
        <View>
          <TextLabel content={`Product ${index + 1}: ${name}`} style={tailwind("font-bold text-gray-400")} />
        </View>

        <View>
          {localList.length > 0 ? (
            localList.map((product, index) => (
              <View key={index}>
                <View style={tailwind("mb-2")}>
                  <View style={tailwind("flex-row items-center")} >
                    <FormLabel text={`Price ${index + 1}`} required={true} />
                    {localList.length > 1 ? (
                      <View style={tailwind("flex-grow items-end")} >
                        <TouchableOpacity onPress={() => { prices.splice(index, 1); setTriggerUpdate(!triggerUpdate) }}>
                          <TrashIcon height={15} width={15} />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  <View style={tailwind("flex flex-row justify-between")}>
                    <View style={tailwind("w-[48%]")}>
                      <TextInputField
                        number={true}
                        placeholder={"0.00"}
                        value={localList[index].value}
                        editable={true}
                        shadow={true}
                        onChangeText={(val) => { updateValue("value", val, index) }}
                        hasError={Object.keys(priceErrors[index] || {}).includes("value")}
                        errorMessage={priceErrors[index] ? priceErrors[index].value : ""}
                      />
                    </View>
                    <View style={tailwind("w-[48%]")}>
                      <DropdownField
                        value={localList[index].unit}
                        items={UNITS_LIST_SINGULAR}
                        onChangeValue={(val) => { updateValue("unit", val, index); }}
                        shadow={true}
                        hasError={Object.keys(priceErrors[index] || {}).includes("unit")}
                        errorMessage={priceErrors[index] ? priceErrors[index].unit : ""}
                      />
                    </View>
                  </View>
                  <TextInputField
                    placeholder={"Remarks..."}
                    value={localList[index].remarks}
                    editable={true}
                    shadow={true}
                    onChangeText={(val) => { updateValue("remarks", val, index) }}
                  />
                </View>

              </View>
            )))
            : null
          }
          <View style={[tailwind("mb-5 mt-2")]} >
            <AddNewButton text="Add Another Price Per Unit" onPress={() => { prices.push({ value: "", unit: LITRE, remarks: "" }); setTriggerUpdate(!triggerUpdate) }} />
          </View>
        </View>
      </View>
    </View>
  )
}


export default PricesField;
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { string } from 'yup';
import { convertValue } from '../../../../constants/Conversions';
import { convertCurrency, Currencies } from '../../../../constants/Currency';
import { UNITS_LIST, UNITS_LIST_SINGULAR } from '../../../../constants/Units';
import { Product } from '../../../../types/Product';
import Checkbox from '../../../atoms/input/checkbox/Checkbox';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import TextInputField from '../../../atoms/input/text/TextInputField';
import TextLabel from '../../../atoms/typography/TextLabel';
import FormDouble from '../../../molecules/alignment/FormDouble';
import DoubleDisplay from '../../../molecules/display/DoubleDisplay';
import FormLabel from '../../../molecules/typography/FormLabel';

interface sectionProps {
  index: number,
  products: Array<{ product: Product, BDN_quantity: { quantity: string, unit: string }, quantity: string, unit: string, price: { value: string, unit: string }, subtotal: string, MOPS?: boolean }>
  HandleChange: (val) => void,
  currency: string,
  errors: any,
}

const ProductSection: React.FC<sectionProps> = ({
  index, products, HandleChange, errors, currency
}) => {
  const [localList, setLocalList] = useState(products);
  const [BDNerrors, setBDNerrors] = useState<{ quantity: string, unit: string }>();
  const [priceErrors, setPriceErrors] = useState<{ value: string, unit: string }>();
  const [toggleMOPS, setToggleMOPS] = useState(products[index].MOPS);
  const tailwind = useTailwind();

  const updateList = (value, type) => {
    let newList = localList;
    switch (type) {
      case "value":
        newList[index].BDN_quantity.quantity = value;
        break;
      case "unit":
        newList[index].BDN_quantity.unit = value;
        break;
      case "value price":
        newList[index].price.value = value;
        newList[index].MOPS = true;
        break;
      case "value unit":
        if (value !== products[index].price.unit) {
          newList[index].price.unit = value;
          newList[index].MOPS = true;
        }
        break;
      case "checkbox":
        newList[index].MOPS = value;
        break;
    }
    newList[index].subtotal = calculateSubtotal(newList[index].BDN_quantity.quantity, newList[index].BDN_quantity.unit);
    setLocalList([...newList]);
  }

  const calculateSubtotal = (quantity: string, unit: string) => {
    let subtotal: number = 0;
    const entered_amount: number = Number(quantity);
    const price_value: number = Number(products[index].price.value);
    const price_unit: string = products[index].price.unit.trim();

    subtotal = convertValue(unit, price_unit, Number(entered_amount)) * price_value;

    return subtotal.toFixed(2).toString();
  }

  useEffect(() => {
    let total: number = 0
    localList.map((item) => { total = total + Number(item.subtotal) })
    HandleChange(total.toString());
  }, [localList]);

  useEffect(() => {
    if (errors) {
      if (errors.price) {
        setPriceErrors(errors.price);
      }
      if (errors.BDN_quantity) {
        setBDNerrors(errors.BDN_quantity);
      }
    } else {
      setBDNerrors(undefined);
    }
  }, [errors])


  return (
    <View>
      <TextLabel content={`Product ${index + 1} - ${products[index].product.name}`} />
      <View style={tailwind("mt-2")}>
        <TextLabel content="BDN Quantity" style={tailwind("font-black")} />
        <View style={tailwind("mt-2")} />
        <View style={tailwind("flex-row")}>
          <View style={tailwind("w-[48%] mr-3")}>
            <TextInputField
              value={products[index].BDN_quantity.quantity}
              onChangeText={(val) => { updateList(val, "value") }}
              placeholder="100"
              editable={true}
              shadow={true}
              number={true}
              hasError={Object.keys(BDNerrors || {}).includes("quantity")}
              errorMessage={BDNerrors ? BDNerrors.quantity : ""}
            />
          </View>
          <View style={tailwind("w-[48%]")}>
            <DropdownField
              placeholder='Select'
              items={UNITS_LIST}
              value={products[index].BDN_quantity.unit}
              onChangeValue={(val) => { updateList(val, "unit") }}
              shadow={true}
              hasError={Object.keys(BDNerrors || {}).includes("unit")}
              errorMessage={BDNerrors ? BDNerrors.unit : ""}
            />
          </View>
        </View>
      </View>

      <DoubleDisplay label={`Initial Ordered Quantity ${index + 1}`} amount={products[index].quantity} unit={products[index].unit.replace(/[0-9]/g, "")} />

      <FormLabel text='Price 1' />
      <Checkbox
        title='MOPS Price'
        checked={products[index].MOPS}
        onChecked={() => {
          setToggleMOPS(!toggleMOPS);
          if (!toggleMOPS == false) {
            updateList(false, "checkbox");
          }
        }}
        style={"mb-1"}
      />
      {
        toggleMOPS
          ?
          <View>
            <FormDouble
              left={
                <TextInputField
                  number={true}
                  value={`${currency} ${products[index].price.value}`}
                  onChangeText={(val) => {
                    updateList(val.replace(currency, "").trim(), "value price");
                  }}
                  placeholder={"0.00"}
                  shadow={true}
                  hasError={Object.keys(priceErrors || {}).includes("value")}
                  errorMessage={priceErrors ? priceErrors.value : ""}
                />
              }
              right={
                <DropdownField
                  value={products[index].price.unit}
                  items={UNITS_LIST_SINGULAR}
                  onChangeValue={(val) => { updateList(val, "value unit") }}
                  hasError={Object.keys(priceErrors || {}).includes("unit")}
                  errorMessage={priceErrors ? priceErrors.unit : ""}
                />
              }
            />
          </View>
          :
          <FormDouble
            left={<TextInputField onChangeText={() => null} placeholder={`${currency}${products[index].price.value}`} editable={false} shadow={true} />}
            right={<TextInputField onChangeText={() => null} placeholder={products[index].price.unit} editable={false} shadow={true} />}
          />
      }

      <View style={tailwind("mb-4")}>
        <View style={tailwind("mb-2")}>
          <TextLabel content="Subtotal" />
        </View>
        <TextInputField
          placeholder={`${currency} ${localList[index].subtotal}`}
          onChangeText={() => null}
          editable={false}
          shadow={true}
        />
      </View>

      <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
    </View>
  )
}

export default ProductSection;
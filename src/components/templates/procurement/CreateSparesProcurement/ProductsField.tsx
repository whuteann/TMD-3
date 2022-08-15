import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import FormDouble from '../../../molecules/alignment/FormDouble';
import FormTextInputField from '../../../molecules/input/FormTextInputField';
import FormLabel from '../../../molecules/typography/FormLabel';

interface InputProps {
  index: number,
  products: Array<{ product: string, sizing: string, quantity: string, unit_of_measurement: string }>,
  productList,
  errors: any,
  deleted: boolean,
  length: number,
  onDelete: () => void
}

const ProductsField: React.FC<InputProps> = ({
  products, productList, index, errors, deleted, length, onDelete
}) => {
  const [updated, setUpdated] = useState(false);
  const [productsLocal, setproductsLocal] = useState<Array<{ product: string, quantity: string, sizing: string, unit_of_measurement: string }>>(products);
  const tailwind = useTailwind();

  const updateList = (type: "product" | "sizing" | "quantity" | "unit_of_measurement", values: any) => {
    let newList = [...productsLocal]

    switch (type) {
      case "product":
        newList[index].product = values;
        break;
      case "sizing":
        newList[index].sizing = values;
        break;
      case "quantity":
        newList[index].quantity = values;
        break;
      case "unit_of_measurement":
        newList[index].unit_of_measurement = values;
        break;
    }

    setproductsLocal([...newList]);
  }

  useEffect(() => {
    setproductsLocal(products);
    setUpdated(!updated);
  }, [productsLocal, deleted]);


  const [productErrors, setProductErrors] = useState<{ product: string, sizing: string, quantity: string, unit_of_measurement: string }>();

  useEffect(() => {
    if (errors) {
      if (errors[index]) {
        setProductErrors(errors[index]);
      } else {
        setProductErrors(undefined);
      }
    } else {
      setProductErrors(undefined);
    }
  }, [errors])

  return (
    <View>
      <View style={tailwind("flex-row")}>
        <View style={tailwind("w-1/5")}>
          <FormLabel text={`Product ${index + 1}`} required={true} />
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
        value={productsLocal[index].product}
        items={productList}
        onChangeValue={(val) => { updateList("product", val) }}
        hasError={Object.keys(productErrors || {}).includes("product")}
        errorMessage={productErrors ? productErrors.product ? productErrors.product : "" : ""}
      />

      <FormTextInputField
        label="Sizing (optional)"
        placeholder="-- Type --"
        value={productsLocal[index].sizing}
        onChangeValue={(val) => { updateList("sizing", val) }}
      />

      <FormDouble
        left={
          <FormTextInputField
            label='Quantity'
            number={true}
            value={productsLocal[index].quantity}
            required={true}
            onChangeValue={(val) => { updateList("quantity", val) }}
            hasError={Object.keys(productErrors || {}).includes("quantity")}
            errorMessage={productErrors ? productErrors.quantity ? productErrors.quantity : "" : ""}
          />
        }

        right={
          <FormTextInputField
            label='Unit of measurement'
            placeholder='Litres'
            value={productsLocal[index].unit_of_measurement}
            required={true}
            onChangeValue={(val) => { updateList("unit_of_measurement", val) }}
            hasError={Object.keys(productErrors || {}).includes("unit_of_measurement")}
            errorMessage={productErrors ? productErrors.unit_of_measurement ? productErrors.unit_of_measurement : "" : ""}
          />
        }
      />
    </View>
  )
}

export default ProductsField;
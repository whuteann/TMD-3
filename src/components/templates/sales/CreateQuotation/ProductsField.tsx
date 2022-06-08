import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import AddButtonText from '../../../atoms/buttons/AddButtonText';
import AddProductsInput from '../../add/AddProductsInput';
import TextInputField from '../../../atoms/input/text/TextInputField';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';
import DropdownField from '../../../atoms/input/dropdown/DropdownField';
import { UNITS_LIST } from '../../../../constants/Units';

interface InputProps {
  index: number,
  products: Array<{
    product: {
      id: string,
      name: string,
      sku: string,
      description: string,
      created_at: string
    },
    quantity: string,
    unit: string,
    prices: Array<{ value: string, unit: string }>
  }>,
  deleted: boolean,
  length: number,
  handleDelete: () => void,
  productsList: any,
  errors: any,
}

type product = {
  product: {
    id: string,
    name: string,
    sku: string,
    description: string,
    created_at: string

  },
  quantity: string,
  unit: string,
  prices: Array<{ value: string, unit: string }>
}

type productField = Array<product>;

const ProductsField: React.FC<InputProps> = ({
  handleDelete, products, productsList, deleted, index, length, errors
}) => {

  const tailwind = useTailwind();
  const [showCreate, setShowCreate] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [productsLocal, setProductsLocal] = useState<productField>(products);
  const [localList, setLocalList] = useState<product>(productsLocal[index]);

  const updateList = (values: any, field: "name" | "quantity" | "unit") => {
    let newList = productsLocal
    switch (field) {
      case "name":
        let product = productsList.filter(obj => { return obj.name === values })[0]
        if (product) {
          newList[index].product = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            created_at: product.created_at
          };
        } else {
          newList[index].product = product
        }
        break;
      case "quantity":
        newList[index].quantity = values;
        break;
      case "unit":
        newList[index].unit = values;
        break;
    }

    setProductsLocal([...newList]);
  }


  useEffect(() => {
    setProductsLocal(products);
    setLocalList(products[index]);
    setUpdated(!updated);
  }, [deleted]);


  const [productErrors, setProductErrors] = useState<{ product: { name: string }, quantity: string, unit: string }>();

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

    <View style={tailwind("mb-4 w-full")} >
      <View>
        <View style={tailwind("flex-row items-center")}>

          <View style={tailwind("flex-row w-1/5")}>
            <View>
              <TextLabel content={`Product ${index + 1}`} style={tailwind("font-bold mr-1")} />
            </View>
            {
              index == 0
                ?
                <TextLabel content={`*`} color='text-red-500' />
                :
                null
            }
          </View>
          {
            length > 1
              ?
              (
                <View style={tailwind("items-end flex-grow")}>
                  <TouchableOpacity onPress={() => { handleDelete() }}>
                    <TrashIcon height={15} width={15} />
                  </TouchableOpacity>
                </View>
              )
              :
              null
          }
        </View>

        <View>
          <DropdownField
            placeholder="Select"
            value={localList.product ? localList.product.name : ""}
            items={productsList ? productsList.map(item => item.name) : [""]}
            onChangeValue={(val) => { updateList(val, "name"); }}
            shadow={true}
            hasError={Object.keys(productErrors || {}).includes("product")}
            errorMessage={productErrors ? productErrors.product ? productErrors.product.name : "" : ""}
          />
        </View>
      </View>

      <View>
        <AddButtonText text="Create New Product" onPress={() => { setShowCreate(!showCreate) }} />

        {
          showCreate
            ?
            (
              <View style={tailwind("mt-2")}>
                <AddProductsInput onCancel={() => { setShowCreate(!showCreate) }} />
              </View>
            )
            :
            <></>
        }
      </View>

      <View>
        <View style={tailwind("mb-1 mt-4")}>
          <TextLabel content="Unit of Measurement" style={tailwind("font-bold")} />
        </View>

        <View style={tailwind("flex flex-row justify-between")}>
          <View style={tailwind("w-6/12")}>
            <View style={tailwind("flex-grow mr-2")}>
              <TextInputField
                placeholder="50,000"
                value={localList.quantity}
                editable={true}
                onChangeText={(val) => { updateList(val, "quantity") }}
                shadow={true}
                hasError={Object.keys(productErrors || {}).includes("quantity")}
                errorMessage={productErrors ? productErrors.quantity : ""}
              />
            </View>
          </View>
          <View style={tailwind("w-6/12")}>
            <View style={tailwind("flex-grow")}>
              <DropdownField
                value={localList.unit}
                items={UNITS_LIST}
                onChangeValue={(val) => { updateList(val, "unit") }}
                shadow={true}
                hasError={Object.keys(productErrors || {}).includes("unit")}
                errorMessage={productErrors ? productErrors.unit : ""}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProductsField;
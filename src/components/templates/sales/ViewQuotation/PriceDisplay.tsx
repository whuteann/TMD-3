import React, { useEffect, useState } from 'react';
import { TrashIcon } from '../../../../../assets/svg/SVG';
import InfoDisplay from '../../../atoms/display/InfoDisplay';
import { useTailwind } from 'tailwind-rn/dist';
import { FlatList, TouchableOpacity, View } from 'react-native';

interface InfoProps {
  product: string,
  status: string,
  unit: string,
  length?: number,
  currency: string,
  index: number,
  prices: Array<{ value: string, unit: string, remarks: string }>,
  products: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string, remarks: string }> }>,
  setProducts?: (val: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string, remarks: string }> }>) => void,
  deleteAProduct?: (deleted: string) => void,
}

const PriceDisplay: React.FC<InfoProps> = ({
  product, unit, prices, index, status, products, setProducts = () => { }, deleteAProduct = () => { }, length = 2, currency
}) => {
  const tailwind = useTailwind();
  const [localProducts, setLocalProducts] = useState(products);
  const deleteProduct = () => {

    let newArr: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string, remarks: string }> }> = localProducts;
    newArr.splice(index, 1);

    let arr = [
      {
        name: "Diesel Fuel-AB890",
        unit: "50,000 per litre",
        prices: [
          { value: "100", unit: "sample", remarks: "" }
        ]
      }];
    arr = [...arr, ...newArr]
    arr.splice(0, 1);


    setLocalProducts(arr);
    deleteAProduct(product);
  }

  useEffect(() => {
    setProducts(localProducts);
  }, [localProducts])

  return (
    <View>
      <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
      {
        status == "Approved" && length > 1
          ?
          // z-50
          <View style={tailwind("absolute top-9  z-50 left-[98%] ")}>
            <TouchableOpacity onPress={() => deleteProduct()}>
              <TrashIcon height={20} width={15} />
            </TouchableOpacity>
          </View>
          :
          null
      }
      <InfoDisplay placeholder={`Product ${index + 1}`} info={product} bold={true} />
      <InfoDisplay placeholder="Unit of Measurement" info={unit} />

      <FlatList
        keyExtractor={(item: any, index: number) => index.toString()}
        data={prices}
        renderItem={({ item, index }: { item: any, index: number }) => (
          <InfoDisplay
            placeholder={`Price ${index + 1}`}
            info={`${currency} ${item.value} per ${item.unit}`}
            secondLine={item.remarks}
          />
        )}
      />
    </View>
  )
}

export default PriceDisplay;
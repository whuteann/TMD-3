import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { Product } from '../../../../types/Product';
import InfoDisplay from '../../../atoms/display/InfoDisplay';
import TextLabel from '../../../atoms/typography/TextLabel';
import RadioButtonGroup from '../../../molecules/buttons/RadioButtonGroup';

interface InfoProps {
  product: string,
  index: number,
  prices: Array<{ value: string, unit: string, remarks: string }>,
  pickedPrices: Array<{ product: Product, unit: string, quantity: string, price: { value: string, unit: string } }>,
  currItem: { product: Product, unit: string, quantity: string, prices: Array<{ value: string, unit: string }> },
  setPickedPrices: (val) => void,
  currency: string,
}

const PriceRadioButtons: React.FC<InfoProps> = ({
  product, index, prices, setPickedPrices, pickedPrices, currItem, currency
}) => {
  const [pickedPrice, setPickedPrice] = useState<number>();
  const tailwind = useTailwind();


  const onHandlePick = (pickedIndex) => {
    let newArr = pickedPrices
    let exist = false;
    let pricePicked = prices[pickedIndex];

    newArr.map((item) => (
      item.product.name == product
        ?
        exist = true
        :
        null
    ));

    if (exist) {
      let i = newArr.findIndex((obj => obj.product.name == product))
      newArr[i].price = pricePicked
    } else {
      if (pricePicked !== undefined) {
        newArr.push({ product: currItem.product, unit: currItem.unit, quantity: currItem.quantity, price: pricePicked })
      }
    }

    setPickedPrices([...newArr]);
    setPickedPrice(pickedIndex);
  }

  let displayPrices: Array<{ content: any, value: string }> = [];
  prices.map((item, index) => {
    displayPrices.push(
      {
        content: (
          <View style={tailwind("flex-row ml-4 w-full")}>
            <View style={tailwind("w-[38.5%]")}>
              <TextLabel content={`Price ${index + 1}`} />
            </View>
            <View style={tailwind("")}>
              <TextLabel content=':' />
            </View>
            <View style={tailwind("ml-2 w-[50%]")}>
              <TextLabel content={`${currency} ${item.value} per ${item.unit}`} />
              <TextLabel content={`${item.remarks}`} />
            </View>
          </View>
        ), value: item.value
      }

    )
  })


  useEffect(() => {
    onHandlePick(pickedPrice);
  }, [pickedPrice])

  return (
    <View>

      <View style={tailwind("border border-neutral-300 mb-5 mt-3")} />
      <InfoDisplay placeholder={`Product ${index}`} info={product} bold={true} />
      <InfoDisplay placeholder="Unit of measurement" info={`${currItem.quantity} ${currItem.unit}`} />
      <View style={{ paddingLeft: 5 }}>
        <RadioButtonGroup displayItem={displayPrices} onPicked={(index) => onHandlePick(index)} />
      </View>

    </View>
  )
}

export default PriceRadioButtons;
import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { SPARES_PROCUREMENTS } from '../../../../constants/Firebase';
import { openDocument } from '../../../../services/StorageServices';
import TextLabel from '../../../atoms/typography/TextLabel';
import LinkText from '../../../molecules/typography/LinkText';

interface InfoProps {
  index: number,
  supplierName: string,
  filename: string,
  quotation_no: string,
  filename_storage: string
}

const SupplierRadioButton: React.FC<InfoProps> = ({
  index, supplierName, filename, quotation_no, filename_storage
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Supplier ${index + 1}`} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <TextLabel content={`${supplierName}`} />
        </View>
      </View>

      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Attachment`} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <LinkText content={`${filename}`} to={() => { openDocument(SPARES_PROCUREMENTS, filename_storage) }} color={"text-primary"} style={tailwind("font-bold underline")} />
        </View>
      </View>

      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Quotation ${index + 1}`} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <TextLabel content={`${quotation_no}`} />
        </View>
      </View>
    </View>
  )
}

export default SupplierRadioButton;
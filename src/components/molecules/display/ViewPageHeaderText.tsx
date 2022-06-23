import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';

interface ViewSearchProps {
  doc: string,
  id: string,
  status?: string,
}

const ViewPageHeaderText: React.FC<ViewSearchProps> = ({
  doc, id, status = undefined
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("mb-7")}> 
      <TextLabel content={`${doc} No.`} />
      <View style={tailwind("flex-row items-center w-auto flex-wrap")}>
        <TextLabel content={id} style={tailwind("font-bold text-22px w-auto mr-3")} />
        {
          status
            ?
            <View>
              <TextLabel content={`•  ${status}`} style={tailwind("text-gray-400 text-12px italic")} />
            </View>
            :
            null
        }
      </View>
    </View>
  )
}

export default ViewPageHeaderText;
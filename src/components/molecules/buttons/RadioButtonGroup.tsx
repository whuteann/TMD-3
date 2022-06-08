import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';

interface InputProps {
  onPicked: (index: number | undefined) => void,
  displayItem: Array<{ content: any, value: string }>;
}

const RadioButtonGroup: React.FC<InputProps> = ({
 displayItem, onPicked
}) => {
  const tailwind = useTailwind();
  const [picked, setPicked] = useState("");
  const [index, setIndex] = useState<number>();

  useEffect(() => {
    onPicked(index);
  }, [index])

  return (
    <View style={tailwind("w-full")}>
      {displayItem.map((item, index) => {
        return (
          <View key={index} style={tailwind("flex-row")}>
            <TouchableOpacity
              style={tailwind("h-6 w-6 bg-white box-card-shadow mb-3 rounded-full items-center")}
              onPress={() => {
                setIndex(index);
                setPicked(item.value)
              }}>
              {picked == item.value ? <View style={tailwind("h-4 w-4 bg-primary mt-1  box-card-shadow rounded-full")} /> : null}
            </TouchableOpacity>

            {item.content}
          </View >
        );
      })}
    </View >
  );
}

export default RadioButtonGroup;
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThreeDotsIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';

interface inputProps {
  label: string
}

const TaskListTab: React.FC<inputProps> = ({
  label
}) => {
  const tailwind = useTailwind();

  return (
    <TouchableOpacity>
      <View style={[styles.boxWithShadow, tailwind("bg-white flex flex-row items-center px-2 pl-4 w-full h-20 mb-5")]}>
        <View style={tailwind("flex-row w-full items-center pl-5")}>
          <View style={[tailwind("w-5 h-5 rounded-full mr-5"), styles.boxWithShadow]} />
          <View style={tailwind("w-10/12 flex-col")}>
            <TextLabel content={label} style={tailwind("font-bold text-18px m-0")} />
            <TextLabel content="Due Today" color={"text-primary"} style={tailwind("text-16px")} />
          </View>
          <View style={tailwind("w-1/12")}>
            <ThreeDotsIcon height={25} width={25} />
          </View>
        </View>
      </View>
    </TouchableOpacity>

  )
}

const styles = StyleSheet.create({
  boxWithShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    elevation: 2,
  }
});

export default TaskListTab;
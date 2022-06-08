import React from "react";
import { FlatList, View } from "react-native";
import ChartLabel from "./ChartLabel";
import PieChartMainMenu from "./PieChartMainMenu";
import { useTailwind } from "tailwind-rn/dist";
import TextLabel from "../../atoms/typography/TextLabel";

interface ChartProps {
  data: Array<{ color: string, quantity: number, label: string }>,
  label: string,
}

const PieChartSection: React.FC<ChartProps> = ({
  data, label
}) => {
  const tailwind = useTailwind();

  return (
    <View style={[tailwind("bg-white w-full pl-3 py-4 mb-6 box-card-shadow")]}>

      <View style={tailwind("flex-col sm:flex-row w-full ")}>

        <View style={tailwind("flex-row justify-center")}>
          <PieChartMainMenu data={data} label={label} />
        </View>

        <View style={tailwind("justify-center")}>
          <View style={tailwind("pl-4 pt-2 flex-col")}>
            <TextLabel content={label} style={tailwind("text-16px font-bold")} />

            <FlatList
              showsVerticalScrollIndicator={false}
              keyExtractor={(item: any, index: number) => index.toString()}
              data={data}
              renderItem={({ item }: { item: any }) => (
                <ChartLabel label={item.label} quantity={item.quantity} color={item.color} />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  )
}


export default PieChartSection;


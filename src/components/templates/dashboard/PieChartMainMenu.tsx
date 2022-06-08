import React from 'react';
import Svg, { G, Circle } from "react-native-svg";
import TextLabel from '../../atoms/typography/TextLabel';
import { useTailwind } from 'tailwind-rn/dist';
import { View } from 'react-native';

interface PieChartProps {
  data: Array<{ color: string, quantity: number, label: string }>,
  label: string,
}


const PieChartMainMenu: React.FC<PieChartProps> = ({
  data, label
}) => {
  const tailwind = useTailwind();

  //radius and circumference of circle
  const size = 180;
  const center = size / 2;
  const strokeWidth = 30;
  const radius = size / 2 - strokeWidth / 2;
  const circleCircumference = 2 * Math.PI * radius;

  //get total
  const total = data.map(item => item.quantity).reduce((prev, curr) => prev + curr, 0);
  let percentages: Array<number> = [];
  let strokeDashoffset: Array<number> = [];
  let angles: Array<number> = [];

  // get percentage
  data.map(item => {
    percentages.push((item.quantity / total) * 100);
  })

  // get stroke dash offset
  percentages.map((item) => {
    strokeDashoffset.push(((100 - item) / 100) * circleCircumference);
  })

  //get angles
  let angle: number = 0
  data.map((item) => {
    angle = angle + (item.quantity / total) * 360
    angles.push(angle);
    // }
  })

  return (
    <View>
      <View>
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation={-90} originX="90" originY="90">

            {total === 0 ? (
              <Circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="#F1F6F9"
                fill="transparent"
                strokeWidth="40"
              />
            ) : (
              <>
                {
                  data.map((item, index) => (
                    <Circle
                      key={index}
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={item.color}
                      fill="transparent"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circleCircumference}

                      strokeDashoffset={strokeDashoffset[index]}
                      rotation={index == 0 ? 0 : angles[index - 1]}

                      originX="90"
                      originY="90"
                      strokeLinecap="round"
                    />
                  ))
                }
              </>
            )
            }
          </G>
        </Svg>

        <View style={tailwind("absolute left-12 top-8")}>
          <TextLabel content={"Total"} alignment="text-center"  />
          <TextLabel content={`${total}`} alignment="text-center"  style={tailwind("text-28px font-bold m-0")}/>
          <TextLabel content={`${label}`} alignment="text-center" />
        </View>

      </View>
    </View>
  );
};

export default PieChartMainMenu;

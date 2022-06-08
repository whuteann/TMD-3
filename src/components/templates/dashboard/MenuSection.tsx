import React from 'react';
import { useTailwind } from 'tailwind-rn';
import {  View } from 'react-native';
import MenuTab from './MenuTab';
import TextLabel from '../../atoms/typography/TextLabel';

interface inputProps {
  title: string,
  navigateProp: any,
  tabs: Array<any>
}

const MenuSection: React.FC<inputProps> = ({
  tabs, title, navigateProp
}) => {
  const tailwind = useTailwind();

  if(tabs.length == 0) {
    return <></>;
  }
  
  return (
    <View style={tailwind("")}>
      <TextLabel content={title} style={tailwind("font-bold text-16px")}  />
      <View style={tailwind("mt-4 flex-wrap flex-row justify-start")}>
        {
          tabs.map((item, index) => {
            return (
              <MenuTab
                key={index}
                icon={item.icon}
                text={item.text}
                onPress={() => item.onPress(navigateProp)}
              />
            )
          })
        }

      </View>
    </View>
  )
}


export default MenuSection;
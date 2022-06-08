import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { PlusSimpleIcon, XSimpleIcon } from "../../../../assets/svg/SVG";
import TextLabel from "../../atoms/typography/TextLabel";
import DrawerItem from "./DrawerItem";

interface DrawerItemProps {
  title: string,
  navigationProp: any,
  itemsList: Array<any>,
}

const DrawerDropdown: React.FC<DrawerItemProps> = ({
  title, navigationProp, itemsList
}) => {
  const [open, setOpen] = useState(false);
  const tailwind = useTailwind();

  return (
    <View>
      <TouchableOpacity onPress={() => { setOpen(!open); }}>
        <View style={tailwind("pt-3 flex-row")}>
          <View style={[tailwind("mb-3 w-[86%]")]}>

            <TextLabel content={title} color={"text-gray-primary"} style={tailwind("font-bold")} />
          </View>
          {open ?
            <View style={{ marginLeft: 6, marginTop: 6 }}>
              <XSimpleIcon height={9} width={9} />
            </View>
            :
            <View style={{ paddingBottom: 1 }}>
              <PlusSimpleIcon height={21} width={21} />
            </View>
          }
        </View>
      </TouchableOpacity>

      {open ? (
        <View>
          {itemsList.map((item) => (
            <DrawerItem key={item.text} {...item} onPress={() => { item.onPress(navigationProp) }} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

export default DrawerDropdown;
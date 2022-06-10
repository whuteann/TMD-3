import React, { useState } from "react";
import { useTailwind } from "tailwind-rn";
import { DrawerNavigationProps } from "../../../navigations/NavigationProps/NavigationProps";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { LogoAndTextIcon, LogoutIcon } from "../../../../assets/svg/SVG";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSelector } from "react-redux";
import { User } from "../../../types/User";
import { TokenSelector, UserSelector } from "../../../redux/reducers/Auth";
import { auth } from "../../../functions/Firebase";
import TextLabel from "../../atoms/typography/TextLabel";
import DrawerItem from "./DrawerItem";
import DrawerDropdown from "./DrawerDropdown";
import { UserRole } from "../../../types/Common";
import details from "../../../Lists/DrawerItemsList/Details";
import profile from "../../../Lists/DrawerItemsList/Profile";
import departments from "../../../Lists/DrawerItemsList/Departments";
import sales from "../../../Lists/DrawerItemsList/Sales";
import procurements from "../../../Lists/DrawerItemsList/Procurements";
import { removePushNotification } from "../../../services/NotificationServices";

const Drawer = ({ navigation }: DrawerNavigationProps<"Dashboard">) => {
  const user: User | null = useSelector(UserSelector);
  const token: string | null = useSelector(TokenSelector);
  const tailwind = useTailwind();
  const permissions = user?.permission;
  let role: UserRole | undefined = user?.role;
  let name: string | undefined = user?.name;
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width)

  const handleSignOut = async () => {
    await removePushNotification(user?.id!, token!, () => {
      auth.signOut().then(() => {
      }).catch((error) => {
      });
    }, () => { });
  }

  return (
    <DrawerContentScrollView>
      <View style={tailwind("pl-5 pr-2")}>
        <View style={tailwind("pt-8")}>
          {screenWidth < 1025 ? (
            <View>
              <TextLabel content={name || ""} style={tailwind("text-22px font-bold")} />

              <TextLabel content={role || ""} />
            </View>
          ) : (
            <View style={tailwind("flex-row items-center")}>
              <LogoAndTextIcon height={70} width={220} />
            </View>
          )}

          <View style={tailwind("mt-7")}>
            {profile(undefined).map((item) => (
              <DrawerItem key={item.text} {...item} onPress={() => item.onPress(navigation)} />
            ))}
          </View>

        </View>
        <DrawerDropdown title="Sales" navigationProp={navigation} itemsList={sales(permissions)} />
        <DrawerDropdown title="Procurement" navigationProp={navigation} itemsList={procurements(permissions)} />
        <DrawerDropdown title="Department" navigationProp={navigation} itemsList={departments(undefined)} />
        <DrawerDropdown title="Details" navigationProp={navigation} itemsList={details(undefined)} />

        <View style={tailwind("pt-3")}>
          <View style={tailwind("mb-3")}>
            <TextLabel content="Apps" color="text-gray-primary" style={tailwind("font-bold")} />
          </View>
          

          <TouchableOpacity onPress={() => { handleSignOut() }}>
            <View style={tailwind("flex-row items-center mb-2")}>
              <View style={tailwind("mr-5")}>
                <LogoutIcon height={25} width={25} />
              </View>
              <View>
                <TextLabel content="Log out" />
              </View>
            </View>
          </TouchableOpacity>

        </View>

      </View>
    </DrawerContentScrollView>
  )
};

export default Drawer;
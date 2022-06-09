import React, { useEffect, useState } from 'react';
import { useTailwind } from 'tailwind-rn';
import { DrawerNavigationProps } from '../../navigations/NavigationProps/NavigationProps';
import { Dimensions, Platform, View } from 'react-native';
import MenuSection from '../../components/templates/dashboard/MenuSection';
import DrawerContent from "../../components/templates/drawer/DrawerContent"
import DashboardDesktopExtra from '../../components/templates/dashboard/DashboardDesktopExtras';
import TextLabel from '../../components/atoms/typography/TextLabel';
import { useSelector } from 'react-redux';
import { UserSelector } from '../../redux/reducers/Auth';
import Body from '../../components/atoms/display/Body';
import HeaderDashboard from '../../components/templates/dashboard/HeaderDashboard';
import sales from '../../Lists/MenuSectionList/Sales';
import procurements from '../../Lists/MenuSectionList/Procurements';
import NotificationButton from '../../components/templates/dashboard/notification/NotificationButton';
import RegularButton from '../../components/atoms/buttons/RegularButton';
import { sendNotifications } from '../../services/NotificationServices';
import { SUPER_ADMIN_ROLE } from '../../types/Common';

const Dashboard = ({ navigation, route }: DrawerNavigationProps<"Dashboard">) => {
  const tailwind = useTailwind();

  const user = useSelector(UserSelector);
  const permissions = user?.permission;
  const name = user?.name;

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width)

  useEffect(() => {
    if (user?.contacts?.length == 0 || user?.contacts?.[0].number == "" || user?.contacts == undefined) {
      navigation.navigate("Profile", { docID: user?.id });
    };
  }, []);

  return (
    <Body
      header={
        <HeaderDashboard
          left={{ onPress: () => navigation.openDrawer() }}
          navigation={navigation}
          middle={{ onPress: () =>{} }}
        />
      }
      isFullScreen={true}>

      <View style={tailwind('md:flex-row flex w-full')}>
        <View style={tailwind(`w-96 bg-white px-10 box-card-shadow hidden ${Platform.OS == "web" ? "xl:block" : ""} `)}>
          <DrawerContent navigation={navigation} route={route} />
        </View>

        <View style={tailwind(`flex-1 pt-5 sm:px-8 lg:px-20`)}>
          {/* {screenWidth <= 968 ? (<SearchBar placeholder='Search' />) : null} */}

          <View style={tailwind("flex-row justify-between")} >
            <View style={tailwind("flex-wrap w-full")}>
              <TextLabel content={`Good day, ${name}!`} style={tailwind("text-30px font-bold")} />
              {/* <TextLabel content="You created 0 quotations" /> */}
            </View>
            {
              Platform.OS == "web" && screenWidth > 1279
                ?
                <NotificationButton navigation={navigation} />
                :
                <></>
            }
          </View>
          {/* <View style={tailwind("flex-col sm:flex-row md:flex-row lg:flex-row justify-between")} >
            {pending ? (
              <BigMenuTab title="Reminder" icon={<ReminderListIcon height={60} width={60} />} onPress={() => { }}
                text={
                  <View style={tailwind("flex-row flex-wrap")}>
                    <TextLabel content="You have " style={tailwind("font-bold mb-0 text-12px")} />
                    <TextLabel content={`10 quotation `} color={"text-primary"} style={tailwind("font-bold mb-0 text-12px")} />
                    <TextLabel content="in pending" style={tailwind("font-bold mb-0 text-12px")} />
                  </View>
                }
              />
            ) : null}
            <BigMenuTab title="Create Task List" icon={<ListIcon height={60} width={60} />} onPress={() => { }}
              text={
                <View style={tailwind("w-full")}>
                  <TextLabel content="Task list helps keep track of your daily jobs" style={tailwind("font-bold mb-0 flex-wrap text-12px")} />
                </View>}
            />
          </View> */}
          <View style={tailwind("flex-col lg:flex-row items-start mt-7 justify-between flex-1")}>
            <View style={tailwind("w-full lg:w-1/2 lg:pr-10 order-2 lg:order-1")}>
              <MenuSection title="Sales Related:" tabs={sales(permissions)} navigateProp={navigation} />

              <MenuSection title="Procurement Related:" tabs={procurements(permissions)} navigateProp={navigation} />
            </View>

            <View style={tailwind(`w-full lg:w-1/2 ${Platform.OS == "web" ? "block" : ""} lg:pl-10 order-1 lg:order-2`)}>
              <DashboardDesktopExtra />
            </View>
          </View>
        </View>
      </View>
    </Body>
  )
}

export default Dashboard;
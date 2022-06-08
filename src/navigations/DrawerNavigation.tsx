import * as React from 'react';
import { createDrawerNavigator} from '@react-navigation/drawer';
import DrawerContent from "../components/templates/drawer/DrawerContent";
import Dashboard from '../features/dashboard/Dashboard';
import { View } from 'native-base';

import { useTailwind } from 'tailwind-rn/dist';

const Drawer = createDrawerNavigator();


const DrawerNavigation = () =>{
  const tailwind = useTailwind();

  return (
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props}/>}
        screenOptions={{headerShown: false}}
      >
        <Drawer.Screen name="menu" component={Dashboard} options={{ title: 'Dashboard' }}/>
      </Drawer.Navigator>
  );
} 

export default DrawerNavigation;
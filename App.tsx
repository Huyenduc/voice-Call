import React, { useState } from 'react'
import { Text, View } from 'react-native'
import Test from './src/test';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Icon } from '@rneui/themed';

import  Notification from './src/notification'

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const App = () => {
  // const [open, setOpen] = useState(true);



  const Home = () => {
    return (
      <View><Text>Home</Text></View>
    )
  }


  const SettingsScreen = () => {
    return (
      <View><Text>JDKDKDK</Text></View>
    )
  }


  // function MyTabs() {
  //   return (
  //     <Tab.Navigator screenOptions={{headerShown:false}}>
  //       <Tab.Screen name="Home" component={Home} 
  //           options={{
  //             tabBarIcon:()=>{
  //               <Icon name='home'/>
  //             }

  //           }}
  //       />
  //       <Tab.Screen name="Settings" component={SettingsScreen} />
  //     </Tab.Navigator>
  //   );
  // }
  return (
    // <Test />
    <Notification/>
    // <NavigationContainer>
    //   <Stack.Navigator screenOptions={{headerShown:false}}>
    //     <Stack.Screen name="Home" component={MyTabs} />
    //   </Stack.Navigator>
    // </NavigationContainer>
    // <View>
    //   <Text>dslmdmscsc sc s,ddjqbdqjdqjdjqnjdn</Text>
    // </View>
  )
}

export default App
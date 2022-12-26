
import React, { useEffect } from 'react'
import { View, Text,Alert } from 'react-native'


import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

async function getToken() {
    const devicesToken = await messaging().getToken();
    console.log('devicesToken', devicesToken)
}



const Notification = () => {
    useEffect(() => {
        // Alert.alert('A new FCM message arrived!')
        const a = async () => {
            await requestUserPermission();
            await getToken();
            messaging().onNotificationOpenedApp(remoteMessage =>{
                
                Alert.alert("Open notification "    )
            })
            const unsubscribe = messaging().onMessage(async remoteMessage  => {
                console.log(remoteMessage)
                Alert.alert('A new FCM message arrived!');
              });
          
              return unsubscribe;
        }
        a();
    }, [])
    return (
        <View>
            <Text>jwdkskj</Text>
        </View>
    )
}

export default Notification
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-dev-client';
import GameScreen from './GameScreen';
import ChatScreen from './ChatScreen';
import Calendar from './Calendar';
import Profile from './Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, UIManager } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Starter from './Starter';
import 'expo-dev-client';

import { UserContext } from '@/contexts/UserContext';

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

export default function Page() {

  useEffect(() => {
    async function prepare() {
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  const user = useContext(UserContext);
  const [isLoading, setIsLoading ] = useState(true);
  const [showBottomNav, setShowBottomNav] = useState(true);

  console.log(user);

  return (
    <SafeAreaProvider>
      {!user.email ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Starter"
            component={Starter}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <>
          {isLoading && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'white' }}>
              <Image source={require('../../public/loadingscreen.png')} style={{ width: '100%', height: '100%' }} />
            </View>
          )}
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false,
              tabBarIcon: ({ focused, size }) => {
                let iconSource;
                let iconStyle = styles.tabIcon;
                if (focused) {
                  iconStyle = { ...styles.tabIcon, ...styles.selectedTabIcon };
                }
                if (route.name === 'Game') {
                  iconSource = require('../../public/disk.png');
                } else if (route.name === 'Chat') {
                  iconSource = require('../../public/bee-hive.png');
                } else if (route.name === 'Profile') {
                  iconSource = require('../../public/beekeeper.png');
                } else if (route.name === 'Calendar') {
                  iconSource = require('../../public/calendar.png');
                }
                
                return <View style={iconStyle}><Image source={iconSource} style={{ width: size + 10, height: size + 10 }} /></View>;
              },
              tabBarStyle: { height: 90, display: showBottomNav ? null : 'none', paddingTop: 10 },
            })}
          >
            <Tab.Screen name="Game">
              {props => <GameScreen {...props} setIsLoading={setIsLoading} setShowBottomNav={setShowBottomNav} />}
            </Tab.Screen>
            <Tab.Screen name="Calendar">
              {props => <Calendar  {...props} />}
            </Tab.Screen>
            <Tab.Screen name="Profile">
              {props => <Profile {...props} />}
            </Tab.Screen>
            <Tab.Screen name="Chat" options={{ tabBarStyle: { display: 'none' }, }}>
              {props => <ChatScreen {...props} onBack={() => props.navigation.goBack()} />}
            </Tab.Screen>
          </Tab.Navigator>
        </>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
  },
  selectedTabIcon: {
    backgroundColor: '#ffeb99', // Customize this color to match the blue background
    borderColor: '#FFCE00', // Slightly darker shade for the border
    borderWidth: 2,
  },
});

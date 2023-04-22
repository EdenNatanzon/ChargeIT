import React from "react";
import {View, Text} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Splash from "./src/screens/authentication/Splash";
import Onboarding from "./src/screens/authentication/Onboarding";
import Login from "./src/screens/authentication/Login";
import RegistrationScreen from "./src/screens/authentication/RegistrationScreen";
import { Provider as AuthProvider } from "./src/context/AuthContext";
import UserProfileScreen from "./src/screens/UserProfileScreen";
import ChargeRequestScreen from "./src/screens/ChargeRequestScreen";

// import { createAppContainer, createSwitchNavigator } from "react-navigation";
// import {createMaterialBottomTabNavigator} from "react-navigation-material-bottom-tabs";

// import {Splash, Onboarding} from "./src/screens"
// import WelcomeScreen from "./src/screens/WelcomeScreen";
// import RegistrationScreen from "./src/screens/RegistrationScreen";
// import LoginScreen from "./src/screens/LoginScreen";
// import ChargeRequestScreen from "./src/screens/ChargeRequestScreen";
// import CreateStationScreen from "./src/screens/CreateStationScreen";
// import UserProfileScreen from "./src/screens/UserProfileScreen";
// import {Provider as AuthProvider} from './src/context/AuthProvider'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// const switchNavigator = createSwitchNavigator({
//   loginFlow: createStackNavigator({
//     Welcome:WelcomeScreen,
//     Registration: RegistrationScreen,
//     Login: LoginScreen
//   }),
//   chargingFlow: createMaterialBottomTabNavigator({
//     CreateStation: CreateStationScreen,
//     ChargeRequest: ChargeRequestScreen,
//     UserProfile: UserProfileScreen
//   })}
// );

//const App = createAppContainer(switchNavigator);

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Splash" component={Splash}/>
                <Stack.Screen name="Onboarding" component={Onboarding}/>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="RegistrationScreen" component={RegistrationScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
        //     ,
        // <NavigationContainer>
        //     <Tab.Navigator>
        //         <Tab.Screen name="UserProfile" component={UserProfileScreen} />
        //         <Tab.Screen name="Charge" component={ChargeRequestScreen} />
        //     </Tab.Navigator>
        // </NavigationContainer>
    )
}

//export default App;
export default () => {
  return (
      <AuthProvider>
        <App />
      </AuthProvider>
  );
};


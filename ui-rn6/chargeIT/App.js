import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createDrawerNavigator} from '@react-navigation/drawer';
import {MaterialIcons} from "@expo/vector-icons";
import {I18nManager} from "react-native";

import Splash from "./src/screens/authentication/Splash";
import Onboarding from "./src/screens/authentication/Onboarding";
import Login from "./src/screens/authentication/Login";
import Registration from "./src/screens/authentication/Registration";
import AfterRegistrationDetailsCompletion from "./src/screens/authentication/AfterRegistrationDetailsCompletion"
import UserProfile from "./src/screens/mainFlow/UserProfile";
import MyStations from "./src/screens/mainFlow/MyStations";
import EditStation from "./src/screens/station/EditStation";
import ResolveAuthScreen from "./src/screens/authentication/ResolveAuthScreen";
import StationWatchScreen from "./src/screens/mainFlow/StationWatchScreen";
import StationSelectScreen from "./src/screens/mainFlow/StationSelectScreen";
import SelectChargingStation from "./src/screens/mainFlow/SelectChargingStation";
import EditProfile from "./src/screens/authentication/EditProfile";
import CreateStation from "./src/screens/mainFlow/CreateStation";
import AddReview from "./src/screens/mainFlow/AddReview";
import Bill from "./src/screens/statistics/Bill";
import Revenue from "./src/screens/statistics/Revenue";
import QRScanScreen from "./src/screens/station/QRScanScreen"
import SelectLocationByMap from "./src/screens/mainFlow/SelectLocationByMap";
import StationCreated from "./src/screens/station/StationCreated";

import {Provider as AuthProvider} from "./src/context/AuthContext";
import {Provider as StationsProvider} from "./src/context/StationsContext";
import {Provider as UsersProvider} from "./src/context/UsersContext";
import {Provider as ReviewsProvider} from "./src/context/ReviewsContext"


I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function StackNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {/*<Stack.Screen name="QRScanScreen" component={QRScanScreen}/>*/}
            <Stack.Screen name="Splash" component={Splash}/>
            <Stack.Screen name="Login" component={Login}/>
            <Stack.Screen name="Registration" component={Registration}/>
            <Stack.Screen name="DetailsCompletion" component={AfterRegistrationDetailsCompletion}/>
            <Stack.Screen name="Onboarding" component={Onboarding}/>
            <Stack.Screen name="Resolve" component={ResolveAuthScreen}/>
            <Stack.Screen name="TabNavigator" component={TabNavigator}/>
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator}/>
        </Stack.Navigator>
    );
}

function DrawerNavigator() {
    return (
        <Drawer.Navigator drawerStyle={{backgroundColor: '#f2f2f2', width: 100}} screenOptions={{
            headerTitle: "",
            drawerContainerStyle: {
                backgroundColor: '#f2f2f2'
            }
        }}>
            <Drawer.Screen name="TabNavigator" component={TabNavigator} options={{drawerItemStyle: {display: 'none'}}}/>
            <Drawer.Screen name="My Payments" component={Bill}/>
            <Drawer.Screen name="My Profits" component={Revenue}/>
        </Drawer.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen
                name="UserProfile"
                component={UserProfile}
                options={{
                    title: "My Profile",
                    tabBarIcon: (tabInfo) => (
                        <MaterialIcons name="home" size={24} color={tabInfo.tintColor}/>
                    ),
                }}
            />
            <Tab.Screen
                name="CreateStation"
                component={CreateStation}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            /><Tab.Screen
            name="StationCreated"
            component={StationCreated}
            options={{
                tabBarButton: () => null,
                tabBarVisible: false,
            }}
        />
            <Tab.Screen
                name="Stations"
                component={MyStations}
                options={{
                    title: "Manage Stations",
                    tabBarIcon: (tabInfo) => (
                        <MaterialIcons
                            name="ev-station"
                            size={24}
                            color={tabInfo.tintColor}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="EditStation"
                component={EditStation}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="EditProfile"
                component={EditProfile}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="Charge"
                component={SelectChargingStation}
                options={{
                    title: "Charge",
                    tabBarIcon: (tabInfo) => (
                        <MaterialIcons name="map" size={24} color={tabInfo.tintColor}/>
                    ),
                }}
            />
            <Tab.Screen
                name="SelectLocation"
                component={SelectLocationByMap}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="StationSelectScreen"
                component={StationSelectScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="StationWatchScreen"
                component={StationWatchScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="AddReview"
                component={AddReview}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
            <Tab.Screen
                name="QRScanScreen"
                component={QRScanScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarVisible: false,
                }}
            />
        </Tab.Navigator>
    );
}

const App = () => {
    return (
        <NavigationContainer>
            <StackNavigator/>
        </NavigationContainer>
    );
};

//export default App;
export default () => {
    return (
        <UsersProvider>
            <ReviewsProvider>
                <StationsProvider>
                    <AuthProvider>
                        <App/>
                    </AuthProvider>
                </StationsProvider>
            </ReviewsProvider>
        </UsersProvider>
    );
};

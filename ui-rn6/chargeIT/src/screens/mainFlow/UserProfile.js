import React, {useState, useEffect, useContext} from "react";
import {useIsFocused, useFocusEffect} from "@react-navigation/native";
import {View, Text, StyleSheet, Dimensions, ImageBackground} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Buttons from "../../components/Buttons";
import Spacer from "../../components/Spacer";
import Popup from "../../components/Popup";
import {Feather} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {Context as AuthContext} from "../../context/AuthContext";
import {Context as UsersContext} from "../../context/UsersContext";

const UserProfile = ({navigation}) => {
    const [userData, setUserData] = useState(null);
    const [mail, setMail] = useState(null);
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [phone, setPhone] = useState(null);
    const [isCreditCardEntered, setIsCreditCardEntered] = useState(false);
    const {logout} = useContext(AuthContext);
    const {state, getUserInfo, clearErrorMessage} = useContext(UsersContext);

    const isFocused = useIsFocused();

    const [popupVisible, setPopupVisible] = useState(false);

    const openPopup = () => {
        setPopupVisible(true);
    };

    const closePopup = () => {
        AsyncStorage.removeItem("token");
        setPopupVisible(false);
    };

    //  Remove the errorMsg if available.
    useFocusEffect(
        React.useCallback(() => {
            return () => clearErrorMessage();
        }, [])
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await getUserInfo();
                setMail(user.email);
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setPhone(user.phoneNumber);
                setIsCreditCardEntered(user.isValidIsraeliCreditCard);

            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };

        if (isFocused) {
            fetchData();
        }

        if (state.errorMessage) {
            setPopupVisible(true);
        }

        // Cancel return to the authentication flow:
        navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type === "GO_BACK") {
                e.preventDefault();
            }
        })

    }, [isFocused, state.errorMessage]); // runs only once when the component is mounted

    return (
        <View style={styles.container}>
            <ImageBackground source={image} resizeMode="cover" style={styles.image}>
                <Text style={styles.title}>Hello, {firstName ?? 'User'}</Text>

                <Text style={{marginTop: 20, fontSize: 18, fontWeight: "bold"}}>
                    {userData ? userData.fname : ""} {userData ? userData.lname : ""}
                </Text>

                <View style={styles.fieldsContainer}>
                    <View style={styles.viewGeneral}>
                        <Feather name="mail" style={styles.tinyImages}/>
                        <Text style={styles.label}>Email: </Text>
                        <Text style={styles.value}>{mail}</Text>
                    </View>

                    <View style={styles.viewGeneral}>
                        <Feather name="edit" style={styles.tinyImages}/>
                        <Text style={styles.label}>First name: </Text>
                        <Text style={styles.value}>{firstName}</Text>
                    </View>

                    <View style={styles.viewGeneral}>
                        <Feather name="edit" style={styles.tinyImages}/>
                        <Text style={styles.label}>Last name: </Text>
                        <Text style={styles.value}>{lastName}</Text>
                    </View>

                    <View style={styles.viewGeneral}>
                        <Feather name="phone" style={styles.tinyImages}/>
                        <Text style={styles.label}>Phone number: </Text>
                        <Text style={styles.value}>{phone}</Text>
                    </View>

                    <View style={styles.viewGeneral}>
                        <Feather name="credit-card" style={styles.tinyImages}/>
                        <Text style={styles.label}>Credit-card inserted? </Text>
                        <BouncyCheckbox
                            isChecked={isCreditCardEntered}
                            disableBuiltInState/>
                    </View>
                </View>
                {/*<View style={styles.viewGeneral}>*/
                }
                {/*  <Feather name="battery-charging" style={styles.tinyImages} />*/
                }
                {/*  <Text style={styles.label}>My charging stations:</Text>*/
                }
                {/*  <Text style={styles.value}>{stations}</Text>*/
                }
                {/*</View>*/
                }

                {
                    state.errorMessage ? (
                        <>
                            <Text style={styles.errorMessage}>{state.errorMessage}</Text>
                            <Popup
                                visible={popupVisible}
                                onClose={closePopup}
                                navigation={navigation}
                                txt="Session is over. Please login again."
                                navigateTo={"Login"}
                            />
                        </>
                    ) : null
                }

                <Spacer></Spacer>
                <View style={styles.buttons}>
                    <Buttons
                        btn_text={"Update Profile"}
                        on_press={() =>
                            navigation.navigate("EditProfile", {
                                mail: mail,
                                firstName: firstName,
                                lastName: lastName,
                                phone: phone
                            })
                        }
                    />
                    <Buttons
                        btn_text={"Sign Out"} j
                        on_press={() => logout({navigation})}
                    />
                </View>
            </ImageBackground>
        </View>
    )
        ;
};

const image = require('./../../assets/images/stations.jpg')

const styles = StyleSheet.create({
    image: {
        flex: 1,
    },
    fieldsContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        maxHeight: Dimensions.get('window').height * 0.3,
        top: 50
    },
    title: {
        fontSize: 25,
        fontWeight: "300",
        textAlign: 'center',
        top: 40
    },
    container: {
        flex: 1,
        display: "flex",
        backgroundColor: "#fff",

    },
    label: {
        fontWeight: 300,
        fontSize: 20,
    },
    value: {
        fontSize: 16,
        marginBottom: 20,
    },
    viewGeneral: {
        flexDirection: "row",
        alignContent: "center",
        alignSelf: 'center'

    },
    tinyImages: {
        color: "#333333",
        fontSize: 20,
        marginRight: 10,
    },
    buttons: {
        alignItems: "center",
        paddingTop: 50,
        bottom: -60
    },
    errorMessage: {
        fontSize: 16,
        marginLeft: 15,
        marginTop: 15,
    },
});

export default UserProfile;

import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ImageBackground
} from "react-native";
import {useFocusEffect, useRoute} from "@react-navigation/native";
import {formatCardNumber,updateUser} from "../../hooks/userUtils";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import Buttons from "../../components/Buttons";
import basicApi from "../../api/basicApi";
import ErrorText from "../../components/ErrorText";
import image from "../../assets/images/app-background-new.jpg";

const EditProfile = ({navigation}) => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [formattedCardNumber, setFormattedCardNumber] = useState('');
    const route = useRoute();
    const {mail, firstName, lastName, phone, password} = route.params;

    // Remove the errorMsg if available.
    useFocusEffect(
        React.useCallback(() => {
            return () => setErrorMessage(null);
        }, [])
    );

    useEffect(() => {
        setUserData({
            mail: mail,
            fname: firstName,
            lname: lastName,
            phone: phone,
            password: password
        });
    }, []); // Run only once on component mount

    return (
        <View style={styles.container}>
            <ImageBackground source={image} resizeMode="cover" style={styles.image}>
                <TouchableOpacity onPress={() => this.bs.current.snapTo(0)}>
                    <View
                        style={{
                            height: 100,
                            width: 100,
                            borderRadius: 15,
                            borderWidth: 1,
                            borderColor: "#7eddb1",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 5
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialCommunityIcons
                                name="camera"
                                size={35}
                                color="#fff"
                                style={{
                                    opacity: 0.7,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: "#fff",
                                    borderRadius: 10,
                                }}
                            />
                            <Text style={styles.addPhoto}>Add Photo</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <Text style={{ fontSize: 25,
                    fontWeight: 300,
                    textShadowColor: "gray",
                marginTop: 5}}>
                    {userData ? userData.fname : ""} {userData ? userData.lname : ""}
                </Text>


            <View style={styles.action}>
                <FontAwesome name="user-o" color="#333333" size={20}/>
                <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#666666"
                    autoCorrect={false}
                    value={userData ? userData.fname : ""}
                    onChangeText={(txt) => setUserData({...userData, fname: txt})}
                    style={styles.textInput}
                />
            </View>
            <View style={styles.action}>
                <FontAwesome name="user-o" color="#333333" size={20}/>
                <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#666666"
                    value={userData ? userData.lname : ""}
                    onChangeText={(txt) => setUserData({...userData, lname: txt})}
                    autoCorrect={false}
                    style={styles.textInput}
                />
            </View>
            <View style={styles.action}>
                <Feather name="phone" color="#333333" size={20}/>
                <TextInput
                    placeholder="Phone"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                    returnKeyType={'next'}
                    autoCorrect={false}
                    value={userData ? userData.phone : ""}
                    onChangeText={(txt) => setUserData({...userData, phone: txt})}
                    style={styles.textInput}
                />
            </View>
            <View style={styles.action}>
                <Feather name="mail" color="#333333" size={20}/>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666666"
                    autoCorrect={false}
                    value={userData ? userData.mail : ""}
                    onChangeText={(txt) => setUserData({...userData, mail: txt})}
                    style={styles.textInput}
                />
            </View>
            <View style={styles.action}>
                <FontAwesome name="user-o" color="#333333" size={20}/>
                <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#666666"
                    autoCorrect={false}
                    value={userData ? userData.password : ""}
                    onChangeText={(txt) => setUserData({...userData, password: txt})}
                    style={styles.textInput}
                    secureTextEntry={true}
                />
            </View>
            <View style={styles.paymentView}>
                <Text style={styles.paymentText}>Payment option:</Text>
                <View style={styles.action}>
                    <Feather name="credit-card" color="#333333" size={20}/>
                    <TextInput
                        placeholder="Credit Number"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        onChangeText={(input) => formatCardNumber(input, setUserData, setFormattedCardNumber)}
                        value={formattedCardNumber}
                        maxLength={19}
                        keyboardType={"number-pad"}
                        style={styles.textInput}
                    />
                </View>
                <View style={styles.action}>
                    <Feather name="calendar" color="#333333" size={20}/>
                    <TextInput
                        placeholder="MM"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        onChangeText={(txt) => setUserData({...userData, creditMonth: txt})}
                        maxLength={2}
                        keyboardType={"number-pad"}
                        style={styles.textInput}
                    />
                    <TextInput
                        placeholder="YY"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        onChangeText={(txt) => setUserData({...userData, creditYear: txt})}
                        maxLength={2}
                        keyboardType={"number-pad"}
                        style={styles.textInput}
                    />
                    <TextInput
                        placeholder="CVV"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        onChangeText={(txt) => setUserData({...userData, cvv: txt})}
                        maxLength={3}
                        keyboardType={"number-pad"}
                        style={styles.textInput}
                    />
                </View>
                <View style={styles.action}>
                    <Feather name="edit" color="#333333" size={20}/>
                    <TextInput
                        placeholder="ID Number"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        onChangeText={(txt) => setUserData({...userData, idNumber: txt})}
                        maxLength={9}
                        keyboardType={"number-pad"}
                        style={styles.textInput}
                    />
                </View>
            </View>
            <ErrorText errorMessage={errorMessage}/>
            <Buttons btn_text="Update" on_press={() => updateUser(userData,navigation, setErrorMessage)}/>
            </ImageBackground>
        </View>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addPhoto: {
        color: 'white',
        marginTop: 5,
        size: 9
    },
    image: {
        flex: 1,
        alignItems: "center",

        flexDirection: "column"

    },
    header: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#333333",
        shadowOffset: {width: -1, height: -3},
        shadowRadius: 2,
        shadowOpacity: 0.4,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

    },
    action: {
        flexDirection: "row",
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
        paddingBottom: 5,
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === "ios" ? 0 : -12,
        paddingLeft: 10,
        color: "#333333",
        maxWidth: 250
    },
    paymentView: {
        borderRadius: 10,
        padding: 20,
        minWidth: 300,
        margin: 15,
        backgroundColor: "#ffffffde"
    }
});

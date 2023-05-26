import React, {useState, useEffect, useContext} from "react";
import {useIsFocused, useFocusEffect} from "@react-navigation/native";
import {View, Text, StyleSheet} from "react-native";
import Buttons from "../../components/Buttons";
import Spacer from "../../components/Spacer";
import {Context as StationsContext} from "../../context/StationsContext";
import {ScrollView} from "react-native";

const MyStations = ({navigation}) => {
    const {state, getAllStationsByUser} = useContext(StationsContext);
    const [areStationsAvailable, setAreStationsAvailable] = useState(false);
    const [usersStationsAvailable, setUsersStationsAvailable] = useState(null);

    const isFocused = useIsFocused();

    // Check if there are stations available for the user.
    useEffect(() => {
        const calculateBooleanArgument = async () => {
            try {
                const result = await getAllStationsByUser();
                if (result.length > 0) {
                    setAreStationsAvailable(true);
                    setUsersStationsAvailable(result);
                    console.log(result);
                } else {
                    setAreStationsAvailable(false);
                }
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };

        if (isFocused) {
            calculateBooleanArgument();
        }
    }, [isFocused]);
    //

    const renderStation = (station) => {
        const stationDetails = JSON.parse(Object.values(station)[0]);
        const {id, location, status, pricePerVolt, chargerType, stationName} = stationDetails;

        return (
            <View key={id} style={styles.wrapper}>
                <View  style={styles.stationContainer}>
                    <Text style={styles.stationName}>{stationName}</Text>
                    <Text style={styles.stationStatus}>
                        Charger type: {chargerType}
                    </Text>
                    <Text
                        style={styles.stationStatus}>Status: {status === "NOT_CHARGING" ? "Ready for use" : "Charging"}</Text>
                    <Text style={styles.stationStatus}>Price per Volt: {pricePerVolt}$</Text>
                </View>
            </View>
        );
    };

    if (areStationsAvailable) {
        if (usersStationsAvailable && usersStationsAvailable.length > 0) {
            return (
                <View style={styles.mainView}>
                    <Text style={styles.title}>My Stations</Text>
                    <ScrollView style={styles.scroll}>
                    <View>
                        {usersStationsAvailable.map(renderStation)}
                    </View>
                    </ScrollView>
                    <View>
                        <Buttons
                            btn_text={" Create another station "}
                            on_press={() => navigation.navigate("SelectLocation")}
                        />
                    </View>
                </View>
            );
        }
    } else {
        return (
            <View style={styles.mainView}>
                <Spacer></Spacer>
                <Text style={styles.noStationsText}>
                    You currently don't have any stations.
                </Text>
                <Text style={styles.noStationsText}>Want to make money?</Text>
                <Spacer></Spacer>
                <Buttons
                    btn_text={"Create Station"}
                    on_press={() => navigation.navigate("SelectLocation")}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    mainView: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        flexDirection: 'column',
        marginTop: 100
    },
    title: {
        textAlign: 'center',
        fontSize: 23

    },
    noStationsText: {
        fontSize: 18,
        fontStyle: "italic",
        fontWeight: "400",
    },
    container: {
        flex: 1,
        padding: 10,
    },
    stationContainer: {
        padding: 10,
        marginBottom: 10,
        maxWidth: 350,
        justifyContent: 'center',
        textAlign: 'center',
        justifyItems: 'center',
        borderRight: '4 bold'
    },
    stationName: {
        fontSize: 16,
        fontWeight: "bold",
        paddingBottom: 15
    },
    stationLocation: {
        marginTop: 5,
        fontSize: 14,
    },
    stationStatus: {
        marginTop: 5,
        fontSize: 14,
        color: "gray",
        fontWeight: 'bold'
    },
    scroll: {
        paddingTop: 10
    },

    wrapper: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'space-between',
        marginTop: 30,
        padding: 10,
        color: 'white',
        width: 300,
        maxHeight: 150,
        borderColor: 'white',
        borderRadius: 6,
        borderStyle: 'insert',
        borderWidth: 2,
    }
});

export default MyStations;

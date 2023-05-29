import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import Spacer from "../../components/Spacer";
import Buttons from "../../components/Buttons";
import Map from "../../components/Map";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Context as StationsContext } from "../../context/StationsContext";
import trackMyLocation from "../../hooks/trackMyLocation";

const SelectTemp = ({ navigation }) => {
  const { getCurrentLocation } = useContext(StationsContext);

  const [err] = trackMyLocation(useIsFocused(), getCurrentLocation);

  return (
    <SafeAreaView forceInset={{ top: "always" }}>
      <View>
        <Map />
        {err ? (
          <Text style={styles.errMsg}> Please enable location services</Text>
        ) : null}
        <Spacer></Spacer>
        <View  style={{alignItems: 'center'}}>
        <Buttons
          btn_text={"Watch Stations List"}
          on_press={() => navigation.push("StationSelectScreen")}
        />
        </View>
        <Spacer></Spacer>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errMsg: {
    color: "red",
    fontSize: 23,
    textAlign: "center",
  },
});

export default SelectTemp;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const Request = ({ t }) => {
  const { previousAmount, prevReference } = useLocalSearchParams<{
    previousAmount: string;
    prevReference: string;
  }>();
  const router = useRouter();
  const [amount, setAmount] = useState(previousAmount || "");
  const [reference, setReference] = useState(prevReference || "");

  return (
    <View
      style={{
        marginTop: 50,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "400", marginTop: 20 }}>
        {t("Payment Request")}
      </Text>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "100%",
          marginLeft: 50,
          marginTop: 100,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          {t("Enter Amount")}
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.euroIcon}>€</Text>
          <TextInput
            placeholder="10"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={setAmount}
            value={amount}
            placeholderTextColor={Colors.gray}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "100%",
          marginLeft: 50,
          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "300" }}>
          {t("Reference")}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="What is the purpose of the request?"
            keyboardType="default"
            style={styles.input2}
            onChangeText={setReference}
            value={reference}
            placeholderTextColor={Colors.gray}
          />
        </View>
      </View>
      <TouchableOpacity
        disabled={!amount || !reference ? true : false}
        onPress={() => {
          router.push({
            pathname: "/(authenticated)/(tabs)/qrCode",
            params: {
              amount: amount || previousAmount,
              reference: reference || prevReference,
            },
          });
        }}
        style={{
          height: 50,
          marginTop: 50,
          marginBottom: 15,
          width: "90%",
          backgroundColor: !amount || !reference ? Colors.gray : "black",
          borderRadius: 15,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Image
            source={require("@/assets/images/scanScan.png")}
            style={{ width: 25, height: 25, tintColor: "white" }}
          />
          <Text style={{ color: "white" }}>{t("Generate QR")}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={!amount || !reference ? true : false}
        style={{
          height: 50,
          width: "90%",
          backgroundColor: "rgba(251, 251, 251, 0.4)",
          borderRadius: 15,
          borderWidth: 0.5,
          borderColor: Colors.lightGray,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Image
            source={require("@/assets/images/sendIcon.png")}
            style={{ width: 25, height: 25 }}
          />
          <Text>{t("Share Payment Link")}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 251, 251, 0.4)",
    width: "90%",
    marginTop: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    height: 45,
    paddingHorizontal: 5, // Padding to push content slightly from the border
  },
  euroIcon: {
    color: Colors.dark,
    paddingHorizontal: 5, // Space between the icon and the text
    fontSize: 18, // Adjust size as needed
  },
  input: {
    flex: 1,
    height: "100%", // Match parent height
    color: Colors.dark,
    fontWeight: "500",
    fontSize: 18, // Adjust text size as needed
    paddingHorizontal: 0, // No padding at the sides inside the input
    marginHorizontal: 5, // Space from the euro icon
  },
  input2: {
    flex: 1,
    height: "100%", // Match parent height
    color: Colors.dark,
    fontWeight: "500",
    fontSize: 12, // Adjust text size as needed
    paddingHorizontal: 0, // No padding at the sides inside the input
    marginHorizontal: 5, // Space from the euro icon
  },
});

export default Request;

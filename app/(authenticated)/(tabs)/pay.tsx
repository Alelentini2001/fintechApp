import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/app/ThemeContext";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView } from "expo-camera/next";

const PaymentConfirmationScreen = () => {
  let colorScheme = useTheme().theme;
  const route = useRoute();
  const paymentData = route.params?.paymentData; // Accessing parameters directly
  const { user } = useUser();
  const amount = paymentData.split("&")[0].split("=")[1];
  const reference = paymentData.split("&")[1].split("=")[1];
  const merchantUsername = paymentData.split("&")[2].split("=")[1];
  const merchantId = paymentData.split("&")[3].split("=")[1];
  const router = useRouter();
  const handleAcceptPayment = async () => {
    console.log(amount, reference, merchantUsername, merchantId);
    // try {
    //   await firestore().collection('Transactions').add({
    //     amount: paymentData.amount,
    //     reference: paymentData.reference,
    //     payeeUsername: user?.username,
    //     merchantUsername: paymentData.merchantUsername,
    //     payeeId: user?.id,
    //     merchantId: paymentData.merchantId,
    //     timestamp: firestore.FieldValue.serverTimestamp(),
    //   });
    //   Alert.alert("Payment Successful", "Your payment has been processed successfully.");
    Alert.alert(
      "Payment Successful",
      "Your payment has been processed successfully",
      [
        {
          text: "Check your payments",
          onPress: () => {
            router.push("/(authenticated)/(tabs)/home");
          },
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
    // } catch (error) {
    //   console.error("Error saving transaction: ", error);
    //   Alert.alert("Error", "There was a problem processing your payment.");
    // }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === "light" ? Colors.background : Colors.dark,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "400",
          color: colorScheme === "light" ? Colors.dark : Colors.background,
        }}
      >
        Amount: €{amount}
      </Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "400",
          color: colorScheme === "light" ? Colors.dark : Colors.background,
        }}
      >
        Reference: {reference}
      </Text>
      <TouchableOpacity
        style={{
          width: "80%",
          marginTop: 30,
          height: 50,
          backgroundColor:
            colorScheme === "light" ? Colors.dark : Colors.background,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
        }}
        onPress={handleAcceptPayment}
      >
        <Ionicons
          name="paper-plane"
          size={22}
          color={colorScheme === "light" ? Colors.background : Colors.dark}
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: colorScheme === "light" ? Colors.background : Colors.dark,
          }}
        >
          Send Payment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaymentConfirmationScreen;

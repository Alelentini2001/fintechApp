import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/app/ThemeContext";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBalanceStore } from "@/store/balanceStore";

const PaymentConfirmationScreen = () => {
  let colorScheme = useTheme().theme;
  const route = useRoute();
  const paymentData = route.params?.paymentData; // Accessing parameters directly
  const { user } = useUser();

  const parseQueryParams = (queryString) => {
    return queryString.split("&").reduce((params, param) => {
      let [key, value] = param.split("=");
      params[key] = value;
      return params;
    }, {});
  };

  const params = parseQueryParams(paymentData);

  const amount = parseFloat(params.amount).toFixed(2);
  const reference = params.reference;
  const merchantUsername = params.merchantUsername;
  const merchantId = params.merchantId;
  const merchantFullName = decodeURIComponent(params.merchantFullName); // Decoding potentially encoded characters
  const merchantEmail = params.merchantEmail;
  const merchantPhone = params.merchantPhone;
  const { balance } = useBalanceStore();
  const router = useRouter();
  const fees = (parseFloat(amount) * 0.005).toFixed(2); // Calculate fees and format to 2 decimal places
  const [userr, setUserr] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const userRef = firestore().collection("users");
      let query = userRef.where(
        "email",
        "==",
        user?.primaryEmailAddress
          ? user.primaryEmailAddress.emailAddress
          : "test"
      );
      let queryphone = userRef.where(
        "phone",
        "==",
        user?.primaryPhoneNumber ? user.primaryPhoneNumber.phoneNumber : "test"
      );

      const snapshot = await query.get();
      const snapshotPhone = await queryphone.get();
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserr(userData);
      } else if (!snapshotPhone.empty) {
        const userData = snapshotPhone.docs[0].data();
        setUserr(userData);
      }
    };
    getUser();
  }, [userr]);

  const handleAcceptPayment = async () => {
    if (balance() >= parseFloat(amount)) {
      try {
        await firestore()
          .collection("transactions")
          .add({
            amount: amount,
            fees: fees,
            reference: reference,
            payeeUsername: user?.username || "",
            merchantUsername: merchantUsername,
            merchantFullName: merchantFullName,
            merchantEmail: merchantEmail,
            merchantPhone: merchantPhone,
            userFullName: user?.fullName,
            payeeId: user?.id || "",
            payeeEmail: user?.primaryEmailAddress
              ? user?.primaryEmailAddress?.emailAddress
              : "test",
            payeePhoneNumber: user?.primaryPhoneNumber
              ? user?.primaryPhoneNumber?.phoneNumber
              : "test",
            merchantId: merchantId,
            referral: user?.referral || "",
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
        //   Alert.alert("Payment Successful", "Your payment has been processed successfully.");
        Alert.alert(
          "Payment Successful",
          "Your payment has been processed successfully",
          [
            {
              text: "Check your payments",
              onPress: () => {
                if (router) {
                  router.push("/(authenticated)/(tabs)/home");
                }
              },
              style: "cancel",
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.error("Error saving transaction: ", error);
        if (error.errors) {
          error.errors.forEach((err) => {
            console.error(err.code, err.message);
          });
        }
        Alert.alert("Error", "There was a problem processing your payment.");
      }
    } else {
      Alert.alert(
        "Error",
        "Your balance is not enough to cover the transaction."
      );
    }
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

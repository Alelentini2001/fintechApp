import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/app/ThemeContext";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBalanceStore } from "@/store/balanceStore";
import CryptoJS from "crypto-js";
import LottieView from "lottie-react-native";
import axios from "axios";
const { createTransactionXDR, getAccount } = require("@/app/stellar/stellar");

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

    const amount = params.amount
        ? parseFloat(params.amount)?.toFixed(2)
        : parseFloat(JSON.parse(paymentData)?.amount)?.toFixed(2);
    const reference = params.reference ?? JSON.parse(paymentData)?.reference;
    const merchantUsername =
        params.merchantUsername ?? JSON.parse(paymentData)?.merchantUsername;
    const merchantId = params.merchantId ?? JSON.parse(paymentData)?.merchantId;
    const merchantFullName =
        decodeURIComponent(params.merchantFullName) ??
        JSON.parse(paymentData)?.merchantFullName;
    const merchantEmail =
        params.merchantEmail ?? JSON.parse(paymentData)?.merchantEmail;
    const merchantPhone =
        params.merchantPhone ?? JSON.parse(paymentData)?.merchantPhone;
    const merchantDestination =
        params.merchantDestination ??
        JSON.parse(paymentData)?.merchantDestination;

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
                user?.primaryPhoneNumber
                    ? user.primaryPhoneNumber.phoneNumber
                    : "test"
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

    const [wallet, setWallet] = useState({
        publicKey: "",
        secretKey: "",
    });
    const [loading, setLoading] = useState(false);
    const [walletDetails, setWalletDetails] = useState([]);
    const [ciao, setCiao] = useState(false);
    // fetch wallet details only when `wallet` or `userr?.pubKey` changes
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setCiao(true);
            try {
                const data = await getAccount(userr?.pubKey);
                if (userr) {
                    console.log(userr?.pubKey);
                    console.log(data.balances);
                    console.log("data", data.balances[0].balance);

                    setWalletDetails(data.balances);
                } else {
                    setWalletDetails([]);
                    throw new Error("Error getting the user");
                }
            } catch (error) {
                console.error("Error fetching wallet details:", error);
                // Handle the error here, such as displaying a message to the user or logging it
            } finally {
                setLoading(false);
                setCiao(false);
            }
        };
        console.log("CIao");
        fetchDetails();
        console.log("CIao2");
    }, [1]);

    const [transactionResult, setTransactionResult] = useState(null);
    const [error, setError] = useState("");

    async function transaction(destination) {
        try {
            const key = CryptoJS.enc.Hex.parse(
                "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc"!
            );
            // Decrypting
            const decrypted = CryptoJS.AES.decrypt(userr?.privKey, key, {
                mode: CryptoJS.mode.ECB,
            });
            const privateKey = decrypted.toString(CryptoJS.enc.Utf8);
            console.log("START");
            const sourceSeed = privateKey;
            const destinationPublicKey =
                "GAUEBS2NHK3CEIVOS2MIV4VYXTF25ZS63GLGQDYM7MZDLYHNNL4PCFYI";
            const amountLumens = 500; // Amount of lumens to send
            const memoText = "Test";
            console.log(destination);

            try {
                const result = await createTransactionXDR(
                    sourceSeed,
                    userr?.pubKey,
                    destination,
                    amount,
                    reference
                );
                console.log(result);
                setTransactionResult(result.memo);
            } catch (err) {
                console.error("Failed to create transaction:", err);
                setError(
                    "Failed to process transaction. Check console for details."
                );
                throw new Error("Payment unsuccesful");
            }
            //await swapXLMtoUSDC(userr?.pubKey, 100, sourceSeed);
            const data = await getAccount(userr?.pubKey);
            if (userr) {
                console.log(userr?.pubKey);
                console.log(data.balances);
                console.log("data", data.balances[0].balance);

                setWalletDetails(data.balances);
            } else {
                setWalletDetails([]);
                throw new Error("Error getting the user");
            }
        } catch (err) {
            throw new Error("Error during the transaction");
        }
    }

    const handleAcceptPayment = async () => {
        const data = await getAccount(userr?.pubKey);

        setLoading(true);
        const usdcWallet = data.balances.find(
            (wallet) => wallet.asset_code === "USDC"
        );
        const usdcBalance = usdcWallet
            ? usdcWallet.balance
            : "Asset not found or balance unavailable";
        console.log(merchantDestination);
        console.log(parseFloat(usdcBalance), parseFloat(amount));
        if (parseFloat(usdcBalance) >= parseFloat(amount)) {
            try {
                await transaction(merchantDestination);
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
                            merchantPubKey: merchantDestination,
                            payeeEmail: user?.primaryEmailAddress
                                ? user?.primaryEmailAddress?.emailAddress
                                : "test",
                            payeePhoneNumber: user?.primaryPhoneNumber
                                ? user?.primaryPhoneNumber?.phoneNumber
                                : "test",
                            merchantId: merchantId,
                            referral: userr?.referral || "",
                            timestamp: firestore.FieldValue.serverTimestamp(),
                        });
                    // Fetch merchant's expoPushToken from Firestore
                    const merchantRef = await firestore()
                        .collection("users")
                        .where("userId", "==", merchantId)
                        .get();

                    if (!merchantRef.empty) {
                        const merchantData = merchantRef.docs[0].data();
                        const expoPushToken = merchantData.expoPushToken;
                        if (expoPushToken) {
                            await sendPushNotification(
                                [expoPushToken],
                                "💰 Payment Received!",
                                `You have received a payment of €${amount}. 🎉`
                            );
                        }
                    }
                    //   Alert.alert("Payment Successful", "Your payment has been processed successfully.");
                    Alert.alert(
                        "Payment Successful",
                        "Your payment has been processed successfully",
                        [
                            {
                                text: "Check your payments",
                                onPress: () => {
                                    if (router) {
                                        router.push(
                                            "/(authenticated)/(tabs)/home"
                                        );
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
                    Alert.alert(
                        "Error",
                        "There was a problem processing your payment."
                    );
                }
            } catch (error) {
                Alert.alert(
                    "Error",
                    "There was a problem processing your payment."
                );

                throw new Error("Error during the transaction");
            }
        } else {
            Alert.alert(
                "Error",
                "Your balance is not enough to cover the transaction."
            );
        }
        setLoading(false);
    };
    const animation = useRef(null);

    const sendPushNotification = async (expoPushToken, title, body) => {
        const message = {
            to: expoPushToken,
            title: title,
            body: body,
        };

        try {
            const response = await axios.post(
                "https://exp.host/--/api/v2/push/send",
                message,
                {
                    headers: {
                        Accept: "application/json",
                        "Accept-encoding": "gzip, deflate",
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Push notification sent successfully:", response.data);
        } catch (error) {
            console.error("Error sending push notification:", error);
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor:
                        colorScheme === "light"
                            ? Colors.background
                            : Colors.dark,
                },
            ]}
        >
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "400",
                    color:
                        colorScheme === "light"
                            ? Colors.dark
                            : Colors.background,
                }}
            >
                Amount: €{amount}
            </Text>
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "400",
                    color:
                        colorScheme === "light"
                            ? Colors.dark
                            : Colors.background,
                }}
            >
                He will receive: €
                {parseFloat(amount) - parseFloat(amount) * 0.005}
            </Text>
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "400",
                    color:
                        colorScheme === "light"
                            ? Colors.dark
                            : Colors.background,
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
                        colorScheme === "light"
                            ? Colors.dark
                            : Colors.background,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 10,
                }}
                disabled={loading}
                onPress={handleAcceptPayment}
            >
                {loading ? (
                    <>
                        <ActivityIndicator
                            size="small"
                            color={
                                colorScheme === "dark"
                                    ? Colors.dark
                                    : Colors.background
                            }
                        />
                        {/* <LottieView
              autoPlay
              ref={animation}
              style={{
                width: 50,
                height: 50,
                backgroundColor: "#fffff",
              }}
              source={require("@/assets/images/logo.json")}
            /> */}
                        <Text
                            style={{
                                color:
                                    colorScheme === "dark"
                                        ? Colors.dark
                                        : Colors.background,
                            }}
                        >
                            Loading...
                        </Text>
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="paper-plane"
                            size={22}
                            color={
                                colorScheme === "light"
                                    ? Colors.background
                                    : Colors.dark
                            }
                        />
                        <Text
                            style={{
                                fontWeight: "bold",
                                fontSize: 16,
                                color:
                                    colorScheme === "light"
                                        ? Colors.background
                                        : Colors.dark,
                            }}
                        >
                            Send Payment
                        </Text>
                    </>
                )}
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

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Share,
    Keyboard,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/app/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import firestore, { firebase } from "@react-native-firebase/firestore";
import CryptoJS from "crypto-js";

const Request = ({ t }) => {
    let colorScheme = useTheme().theme;

    const { previousAmount, prevReference } = useLocalSearchParams<{
        previousAmount: string;
        prevReference: string;
    }>();
    const router = useRouter();
    const [amount, setAmount] = useState(previousAmount || "");
    const [reference, setReference] = useState(prevReference || "");

    const [merchantInfo, setMerchantInfo] = useState(null);
    const { user } = useUser();
    useEffect(() => {
        const fetchMerchantInfo = async () => {
            console.log(user);
            if (user) {
                try {
                    const userRef = firestore().collection("users");
                    const query = userRef.where("userId", "==", user?.id);
                    const snapshot = await query.get();

                    if (!snapshot.empty) {
                        const userData = snapshot.docs[0].data();
                        setMerchantInfo(userData);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchMerchantInfo();
    }, [user]);

    const handleShareLink = async () => {
        console.log(merchantInfo);
        if (merchantInfo) {
            const fullName = merchantInfo.firstName + merchantInfo.lastName;

            const data = {
                amount,
                reference,
                merchantUsername: merchantInfo.username,
                merchantId: merchantInfo.userId,
                merchantFullName: fullName,
                merchantEmail: merchantInfo.email,
                merchantPhone: merchantInfo.phone,
                merchantDestination: merchantInfo.pubKey,
            };
            console.log(data);

            // Encrypt the data
            const secretKey =
                "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc"; // Use a strong secret key
            const key = CryptoJS.enc.Hex.parse(secretKey!);
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
                mode: CryptoJS.mode.ECB,
            }).toString();

            const paymentLink = `QUPLY://payment?data=${encodeURIComponent(
                encrypted
            )}`;
            console.log(paymentLink);

            try {
                await Share.share({
                    message: `Please use this link to make a payment: ${paymentLink}`,
                });
            } catch (error) {
                console.error("Error sharing payment link:", error);
            }
        } else {
            console.error("Merchant information is not available.");
        }
    };

    return (
        <View
            style={{
                paddingTop: 50,
                alignItems: "center",
                height: "100%",
                backgroundColor:
                    colorScheme === "light" ? Colors.background : Colors.dark,
            }}
        >
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "400",
                    marginTop: 20,
                    color:
                        colorScheme === "light"
                            ? Colors.dark
                            : Colors.background,
                }}
            >
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
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "300",
                        color:
                            colorScheme === "dark"
                                ? Colors.background
                                : Colors.dark,
                    }}
                >
                    {t("Enter Amount")}
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor:
                                colorScheme === "light"
                                    ? Colors.background
                                    : Colors.dark,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.euroIcon,
                            {
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                    >
                        €
                    </Text>
                    <TextInput
                        placeholder="10"
                        keyboardType="numeric"
                        style={[
                            styles.input,
                            {
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                        onChangeText={setAmount}
                        value={amount}
                        placeholderTextColor={Colors.gray}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                        }} // Hides the keyboard when return is pressed
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === "Done") {
                                Keyboard.dismiss();
                            }
                        }}
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
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "300",
                        color:
                            colorScheme === "dark"
                                ? Colors.background
                                : Colors.dark,
                    }}
                >
                    {t("Reference")}
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor:
                                colorScheme === "light"
                                    ? Colors.background
                                    : Colors.dark,
                        },
                    ]}
                >
                    <TextInput
                        placeholder={t("What is the purpose of the request?")}
                        keyboardType="default"
                        style={[
                            styles.input2,
                            {
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                        onChangeText={setReference}
                        value={reference}
                        placeholderTextColor={Colors.gray}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                        }} // Hides the keyboard when return is pressed
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === "Done") {
                                Keyboard.dismiss();
                            }
                        }}
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
                    backgroundColor:
                        !amount || !reference
                            ? Colors.gray
                            : colorScheme === "dark"
                            ? Colors.background
                            : Colors.dark,
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
                        style={{
                            width: 25,
                            height: 25,
                            tintColor:
                                colorScheme === "light"
                                    ? Colors.background
                                    : Colors.dark,
                        }}
                    />
                    <Text
                        style={{
                            color:
                                colorScheme === "light"
                                    ? Colors.background
                                    : Colors.dark,
                        }}
                    >
                        {t("Generate QR")}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                disabled={!amount || !reference ? true : false}
                style={{
                    height: 50,
                    width: "90%",
                    backgroundColor:
                        colorScheme === "light"
                            ? Colors.background
                            : Colors.dark,
                    borderRadius: 15,
                    borderWidth: 0.5,
                    borderColor: Colors.lightGray,
                    justifyContent: "center",
                }}
                onPress={handleShareLink}
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
                        style={{
                            width: 25,
                            height: 25,
                            tintColor:
                                colorScheme === "dark"
                                    ? Colors.background
                                    : Colors.dark,
                        }}
                    />
                    <Text
                        style={{
                            color:
                                colorScheme === "dark"
                                    ? Colors.background
                                    : Colors.dark,
                        }}
                    >
                        {t("Share Payment Link")}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        marginTop: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        height: 45,
        paddingHorizontal: 5, // Padding to push content slightly from the border
    },
    euroIcon: {
        paddingHorizontal: 5, // Space between the icon and the text
        fontSize: 18, // Adjust size as needed
    },
    input: {
        flex: 1,
        height: "100%", // Match parent height
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

import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAuth, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./ThemeContext";
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import translations from "@/app/(authenticated)/(tabs)/translations.json";
import firestore from "@react-native-firebase/firestore";
import React from "react";

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0].languageCode || "en";
i18n.enableFallback = true;

const Signup = () => {
    let colorScheme = useTheme().theme;
    const [countryCode, setCountryCode] = useState("+39");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [emailSignUp, setEmailSignUp] = useState(false);
    const [referral, setReferral] = useState("");
    const [referralValid, setReferralValid] = useState(false);
    const [referralError, setReferralError] = useState("");
    const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
    const router = useRouter();
    const { signUp } = useSignUp();

    const validateReferralCode = async () => {
        const usersRef = firestore().collection("users");
        // const query = usersRef
        //   .where("username", "==", referral.toLowerCase())
        //   .limit(1);
        const queryById = usersRef
            .where("userId", "==", referral.toLowerCase())
            .limit(1);

        try {
            const [idResult] = await Promise.all([
                // query.get(),
                queryById.get(),
            ]);
            if (!idResult.empty) {
                setReferralValid(true);
                setReferralError("");
            } else {
                setReferralValid(false);
                setReferralError(
                    "Invalid referral code. Please check and try again."
                );
            }
        } catch (error) {
            console.error("Error validating referral code: ", error);
            setReferralError("Failed to validate referral code.");
        }
    };

    const onSignup = async () => {
        if (!emailSignUp) {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            try {
                await signUp!.create({
                    phoneNumber: fullPhoneNumber,
                });
                signUp!.preparePhoneNumberVerification();
                router.push({
                    pathname: "/verify/[phone]",
                    params: {
                        phone: fullPhoneNumber,
                        referral: referralValid ? referral : "",
                    },
                });
            } catch (err) {
                console.error("Error signing up:", err);
            }
        } else {
            try {
                await signUp!.create({
                    emailAddress: email,
                });
                signUp!.prepareEmailAddressVerification();
                router.push({
                    pathname: "/verify/[phone]",
                    params: {
                        email: email,
                        referral: referralValid ? referral : "",
                    },
                });
            } catch (err) {
                console.error("Error signing up:", err);
            }
        }
    };
    let phoneNumberInput = useRef(null);

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                backgroundColor:
                    colorScheme === "light" ? Colors.background : Colors.dark,
            }}
            behavior="padding"
            keyboardVerticalOffset={keyboardVerticalOffset}
        >
            <View
                style={[
                    defaultStyles.container,
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
                        defaultStyles.header,
                        {
                            color:
                                colorScheme === "dark"
                                    ? Colors.background
                                    : Colors.dark,
                        },
                    ]}
                >
                    {i18n.t("Let's Get Started!")}
                </Text>
                <Text style={defaultStyles.descriptionText}>
                    {emailSignUp
                        ? "Enter your email. We will send you a confirmation code there"
                        : "Enter your phone number. We will send you a confirmation code there"}
                </Text>
                {!emailSignUp ? (
                    <>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Country code"
                                placeholderTextColor={Colors.gray}
                                value={countryCode}
                                keyboardType="phone-pad"
                                onChangeText={setCountryCode}
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
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder={i18n.t("Mobile number")}
                                placeholderTextColor={Colors.gray}
                                keyboardType="numeric"
                                value={phoneNumber}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }} // Hides the keyboard when return is pressed
                                returnKeyType="done"
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === "done") {
                                        Keyboard.dismiss();
                                    }
                                }}
                                onChangeText={setPhoneNumber}
                            />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Referral Code"
                            value={referral}
                            autoCapitalize="none"
                            placeholderTextColor={Colors.gray}
                            onChangeText={
                                referralValid === false
                                    ? setReferral
                                    : undefined
                            } // Disable editing once validated
                            editable={referralValid === false}
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
                        <TouchableOpacity
                            onPress={validateReferralCode}
                            style={[
                                defaultStyles.pillButton,
                                {
                                    flexDirection: "row",
                                    gap: 16,
                                    marginTop: 20,
                                    backgroundColor: referralValid
                                        ? "#43A047"
                                        : colorScheme === "dark"
                                        ? Colors.background
                                        : Colors.dark,
                                },
                            ]}
                            disabled={
                                referral === "" || referralValid !== false
                            }
                        >
                            <Ionicons
                                name={
                                    referralValid
                                        ? "checkmark-circle"
                                        : "person-add"
                                }
                                size={24}
                                color={
                                    referralValid
                                        ? Colors.background
                                        : colorScheme === "dark"
                                        ? Colors.dark
                                        : Colors.background
                                }
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color:
                                        colorScheme === "dark"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                {referralValid
                                    ? "Referral valid"
                                    : "Validate Referral"}
                            </Text>
                        </TouchableOpacity>
                        {referralValid === false && (
                            <Text style={[styles.errorText, { marginTop: 10 }]}>
                                {referralError}
                            </Text>
                        )}
                    </>
                ) : (
                    <>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Email"
                                autoCapitalize="none"
                                placeholderTextColor={Colors.gray}
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
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
                        <TextInput
                            style={styles.input}
                            placeholder="Referral Code"
                            value={referral}
                            placeholderTextColor={Colors.gray}
                            onChangeText={
                                referralValid === false
                                    ? setReferral
                                    : undefined
                            } // Disable editing once validated
                            editable={referralValid === false}
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
                        <TouchableOpacity
                            onPress={validateReferralCode}
                            style={[
                                defaultStyles.pillButton,
                                {
                                    flexDirection: "row",
                                    gap: 16,
                                    marginTop: 20,
                                    backgroundColor: referralValid
                                        ? "#43A047"
                                        : colorScheme === "dark"
                                        ? Colors.background
                                        : Colors.dark,
                                },
                            ]}
                            disabled={
                                referral === "" || referralValid !== false
                            }
                        >
                            <Ionicons
                                name={
                                    referralValid
                                        ? "checkmark-circle"
                                        : "person-add"
                                }
                                size={24}
                                color={
                                    referralValid
                                        ? Colors.background
                                        : colorScheme === "dark"
                                        ? Colors.dark
                                        : Colors.background
                                }
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color:
                                        colorScheme === "dark"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                {referralValid
                                    ? "Referral valid"
                                    : "Validate Referral"}
                            </Text>
                        </TouchableOpacity>
                        {referralValid === false && (
                            <Text style={[styles.errorText, { marginTop: 10 }]}>
                                {referralError}
                            </Text>
                        )}
                    </>
                )}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            height: StyleSheet.hairlineWidth,
                            backgroundColor: Colors.gray,
                        }}
                    />
                    <Text style={{ color: Colors.gray, fontSize: 20 }}>or</Text>
                    <View
                        style={{
                            flex: 1,
                            height: StyleSheet.hairlineWidth,
                            backgroundColor: Colors.gray,
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={[
                        defaultStyles.pillButton,
                        {
                            flexDirection: "row",
                            gap: 16,
                            marginTop: 20,
                            backgroundColor: "#fff",
                        },
                    ]}
                    onPress={() => {
                        //onSignIn(SignInType.Email);
                        setEmailSignUp(!emailSignUp);
                    }}
                >
                    <Ionicons
                        name={emailSignUp ? "call" : "mail"}
                        size={24}
                        color={"#000"}
                    />
                    <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
                        {i18n.t(
                            `Continue with ${
                                emailSignUp ? "phone number" : "email"
                            }`
                        )}
                    </Text>
                </TouchableOpacity>
                <Link href={"/login"} replace asChild style={{ marginTop: 20 }}>
                    <TouchableOpacity>
                        <Text
                            style={[
                                defaultStyles.textLink,
                                {
                                    color:
                                        colorScheme === "light"
                                            ? Colors.primary
                                            : Colors.primaryMuted,
                                },
                            ]}
                        >
                            {i18n.t("Already have an account? Log In")}
                        </Text>
                    </TouchableOpacity>
                </Link>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    style={[
                        defaultStyles.pillButton,
                        phoneNumber !== "" || email !== ""
                            ? styles.enabled
                            : styles.disabled,
                        {
                            marginBottom: 20,
                            backgroundColor:
                                colorScheme === "dark"
                                    ? Colors.background
                                    : Colors.dark,
                        },
                    ]}
                    onPress={onSignup}
                >
                    <Text
                        style={[
                            defaultStyles.buttonText,
                            {
                                color:
                                    colorScheme === "dark"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                    >
                        {i18n.t("Sign Up")}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const { width, height } = Dimensions.get("window");

// Function to determine adaptive style based on screen size
const adaptiveStyle = (size, { small, medium, large }) => {
    if (size < 350) {
        return small;
    } else if (size >= 350 && size < 600) {
        return medium;
    } else {
        return large;
    }
};

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: adaptiveStyle(height, {
            small: "5%",
            medium: "5%",
            large: "5%",
        }),
        flexDirection: "row",
    },
    input: {
        backgroundColor: Colors.lightGray,
        padding: adaptiveStyle(width, { small: 15, medium: 20, large: 25 }),
        borderRadius: 16,
        fontSize: adaptiveStyle(width, { small: 16, medium: 20, large: 24 }),
        marginRight: 10,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    },
    errorText: {
        color: "red",
    },
});
export default Signup;

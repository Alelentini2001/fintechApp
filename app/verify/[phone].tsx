import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import {
    isClerkAPIResponseError,
    useSignIn,
    useSignUp,
    useUser,
} from "@clerk/clerk-expo";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import translations from "@/app/(authenticated)/(tabs)/translations.json";
import { useTheme } from "../ThemeContext";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import * as Random from "expo-crypto";
import { Buffer } from "buffer"; // Import Buffer from the buffer package
import CryptoJS from "crypto-js";
import { authorizeTrustline, getInitialFunds } from "../stellar/stellar";
import React from "react";
const walletSdk = require("@stellar/typescript-wallet-sdk");

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0].languageCode || "en";
i18n.enableFallback = true;

const CELL_COUNT = 6;
const SECRET_KEY =
    "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc";

const PhoneVerify = () => {
    const { phone, signin, email, edit, referral } = useLocalSearchParams<{
        phone: string;
        signin: string;
        email: string;
        edit: string;
        referral: string;
    }>();
    let colorScheme = useTheme().theme;
    const [code, setCode] = useState("");
    const [account, setAccount] = useState<[String, String, walletSdk.Keypair]>(
        []
    );
    const { signIn } = useSignIn();
    const { signUp, setActive } = useSignUp();
    console.log(email, signin);
    const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: code,
        setValue: setCode,
    });

    const createWallet = async () => {
        try {
            let wallet = walletSdk.Wallet.TestNet();
            let account = wallet.stellar().account();
            const rand = Random.getRandomBytes(32);
            const kp = account.createKeypairFromRandom(Buffer.from(rand));

            const secretKeyString = JSON.stringify(kp.secretKey);
            const key = CryptoJS.enc.Hex.parse(SECRET_KEY!);
            const encrypted = CryptoJS.AES.encrypt(secretKeyString, key, {
                mode: CryptoJS.mode.ECB,
            }).toString();

            console.log("Encrypted:", encrypted);
            await getInitialFunds(kp.publicKey);
            await authorizeTrustline(
                kp.secretKey,
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
            );

            return [kp.publicKey, encrypted]; // Return the details instead of setting state
        } catch (error) {
            console.error("Error creating wallet:", error);
            return [null, null, null]; // Return nulls in case of an error
        }
    };

    useEffect(() => {
        console.log("signin === true", signin === "true", referral);
        if (code.length === 6) {
            console.log("code.length === 6", code.length === 6);
            if (signin === "true") {
                verifySignIn();
            } else {
                console.log("verify");
                verifyCode();
            }
        }
    }, [code]);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const verifyCode = async () => {
        console.log(email, phone, referral);
        setLoading(true);
        const [publicKey, encryptedPrivateKey] = await createWallet();
        if (phone !== "" && phone !== "[phone]" && publicKey) {
            try {
                await signUp!.attemptPhoneNumberVerification({ code });
                await setActive!({ session: signUp!.createdSessionId });
                await firestore()
                    .collection("users")
                    .add({
                        userId: signUp?.id,
                        email: signUp?.emailAddress || "",
                        phone: signUp?.phoneNumber,
                        username: signUp?.username?.toLocaleLowerCase() || "",
                        referrall: referral || "",
                        pubKey: publicKey || "",
                        privKey: encryptedPrivateKey || "",
                    });
                setLoading(false);
            } catch (err) {
                console.log("error", JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    Alert.alert("Error", err.errors[0].message);
                }
                setLoading(false);
            }
        } else if (email && publicKey) {
            try {
                console.log("START");
                if (!edit) {
                    const completeSignUp =
                        await signUp!.attemptEmailAddressVerification({
                            code,
                        });

                    // This mainly for debuggin while developing.
                    // Once your Instance is setup this should not be required.
                    if (completeSignUp.status !== "complete") {
                        console.error(JSON.stringify(completeSignUp, null, 2));
                    }

                    // If verification was completed, create a session for the user
                    if (completeSignUp.status === "complete") {
                        await setActive({
                            session: completeSignUp.createdSessionId,
                        });
                    }
                    await firestore()
                        .collection("users")
                        .add({
                            userId: signUp?.id,
                            email: signUp?.emailAddress,
                            phone: signUp?.phoneNumber || "",
                            referral: referral || "",
                            username:
                                signUp?.username?.toLocaleLowerCase() || "",
                            pubKey: publicKey || "",
                            privKey: encryptedPrivateKey || "",
                        });
                    setLoading(false);
                } else {
                    // Normalize the email search to be case-insensitive and trim whitespace
                    const normalizedEmail = email.trim().toLowerCase();
                    const emailAddressObj = user?.emailAddresses.find(
                        (ea) =>
                            ea.emailAddress.trim().toLowerCase() ===
                            normalizedEmail
                    );

                    if (!emailAddressObj) {
                        Alert.alert(
                            "Error",
                            "Email address not found on user profile."
                        );
                        return;
                    }

                    // Attempt to verify the email using the provided code
                    const verificationResult =
                        await emailAddressObj.attemptVerification({
                            code,
                        });
                    console.log(verificationResult);
                    firestore()
                        .collection("users")
                        .where(
                            "email",
                            "==",
                            user?.primaryEmailAddress?.emailAddress || "test"
                        )
                        .get()
                        .then((querySnapshot) => {
                            // Handle the case where no matching email documents found
                            if (querySnapshot.empty) {
                                console.log(
                                    "No documents found with matching email."
                                );
                                // If no email match, try phone
                                return firestore()
                                    .collection("users")
                                    .where(
                                        "phone",
                                        "==",
                                        user?.primaryPhoneNumber?.phoneNumber ||
                                            "test"
                                    )
                                    .get();
                            }
                            return querySnapshot; // Return the found snapshot
                        })
                        .then((querySnapshot) => {
                            // This could be the result of either email or phone query
                            if (querySnapshot.empty) {
                                console.log(
                                    "No documents found with matching phone."
                                );
                                return; // Exit if no documents are found
                            }

                            // If there are matching documents, update each one
                            querySnapshot.forEach((doc) => {
                                doc.ref
                                    .update({
                                        email: normalizedEmail, // Assuming user.imageUrl contains the base64 string of the new avatar
                                    })
                                    .then(() => {
                                        console.log(
                                            "User avatar updated successfully."
                                        );
                                    })
                                    .catch((error) => {
                                        console.error(
                                            "Error updating avatar:",
                                            error
                                        );
                                    });
                            });
                        })
                        .catch((error) => {
                            console.error("Error retrieving user:", error);
                        });
                    setLoading(false);
                    router.back();
                }
            } catch (err) {
                console.log("error", JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    Alert.alert("Error", err.errors[0].message);
                }
                setLoading(false);
            }
        }
    };

    const verifySignIn = async () => {
        setLoading(true);
        if (phone !== "" && phone !== "[phone]") {
            try {
                await signIn!.attemptFirstFactor({
                    strategy: "phone_code",
                    code,
                });
                await setActive!({ session: signIn!.createdSessionId });
                auth()
                    .createUserWithEmailAndPassword(phone, "defaultPassword")
                    .then((userCredential) => {
                        console.log(
                            "User registered with Firebase",
                            userCredential
                        );
                    })
                    .catch((error) => {
                        console.error("Firebase registration failed:", error);
                    });
                setLoading(false);
            } catch (err) {
                console.log("error", JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    Alert.alert("Error", err.errors[0].message);
                }
                setLoading(false);
            }
        } else if (email) {
            try {
                await signIn!.attemptFirstFactor({
                    strategy: "email_code",
                    code,
                });
                await setActive!({ session: signIn!.createdSessionId });
                auth()
                    .createUserWithEmailAndPassword(email, "defaultPassword")
                    .then((userCredential) => {
                        console.log(
                            "User registered with Firebase",
                            userCredential
                        );
                    })
                    .catch((error) => {
                        console.error("Firebase registration failed:", error);
                    });
                // await firestore()
                //   .collection("users")
                //   .add({
                //     userId: signUp?.id,
                //     email: signUp?.emailAddress,
                //     phone: signUp?.phoneNumber,
                //     username: signUp?.username?.toLocaleLowerCase(),
                //     referrall: referral || "",
                //   });
                setLoading(false);
            } catch (err) {
                console.log("error", JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    Alert.alert("Error", err.errors[0].message);
                }
                setLoading(false);
            }
        }
    };

    return (
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
                6-digit code
            </Text>
            <Text
                style={[
                    defaultStyles.descriptionText,
                    {
                        color:
                            colorScheme === "dark"
                                ? Colors.background
                                : Colors.dark,
                    },
                ]}
            >
                Code sent to{" "}
                {phone !== "" && phone !== "[phone]" ? phone : email} unless you
                already have an account
            </Text>
            <CodeField
                ref={ref}
                {...props}
                value={code}
                onChangeText={setCode}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                    <Fragment key={index}>
                        <View
                            onLayout={getCellOnLayoutHandler(index)}
                            key={index}
                            style={[
                                styles.cellRoot,
                                isFocused && styles.focusCell,
                            ]}
                        >
                            <Text style={styles.cellText}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        </View>
                        {index === 2 ? (
                            <View
                                key={`separator-${index}`}
                                style={styles.separator}
                            />
                        ) : null}
                    </Fragment>
                )}
            />
            {!edit && (
                <Link href={"/login"} replace asChild>
                    <TouchableOpacity>
                        <Text style={defaultStyles.textLink}>
                            Already have an account? Log In
                        </Text>
                    </TouchableOpacity>
                </Link>
            )}
            {!edit && (
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <Text
                        style={[
                            defaultStyles.textLink,
                            {
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                                fontSize: 12,
                            },
                        ]}
                    >
                        By registering you accept the
                    </Text>
                    <Link href={"/terms"} asChild>
                        <TouchableOpacity>
                            <Text
                                style={[
                                    defaultStyles.textLink,
                                    { fontSize: 12 },
                                ]}
                            >
                                Terms and Conditions of Quply
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            )}
            {loading && (
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 30,
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"black"} size={"large"} />
                    <Text
                        style={{
                            color:
                                colorScheme === "light"
                                    ? Colors.dark
                                    : Colors.background,
                            fontSize: 12,
                        }}
                    >
                        Loading...
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    codeFieldRoot: {
        marginVertical: 20,
        marginLeft: "auto",
        marginRight: "auto",
        gap: 12,
    },
    cellRoot: {
        width: 45,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
    },
    cellText: {
        color: "#000",
        fontSize: 36,
        textAlign: "center",
    },
    focusCell: {
        paddingBottom: 8,
    },
    separator: {
        height: 2,
        width: 10,
        backgroundColor: Colors.gray,
        alignSelf: "center",
    },
});

export default PhoneVerify;

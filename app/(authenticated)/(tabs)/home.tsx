import Dropdown from "@/components/Dropdown";
import RoundBtn from "@/components/RoundBtn";
import WidgetList from "@/components/SortableList/WidgetList";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Button,
    Image,
    FlatList,
    Dimensions,
    ViewabilityConfig,
    TouchableOpacity,
    useColorScheme,
    Alert,
    ActivityIndicator,
    Platform,
    Linking,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useEffect, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Link, useRouter } from "expo-router";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { useUser } from "@clerk/clerk-expo";
import messaging from "@react-native-firebase/messaging";
import * as walletSdk from "@stellar/typescript-wallet-sdk";
import * as Random from "expo-crypto";
import { Buffer } from "buffer"; // Import Buffer from the buffer package
import CryptoJS from "crypto-js";
import {
    authorizeTrustline,
    createTransactionXDR,
    getAccount,
    swapXLMtoUSDC,
} from "@/app/stellar/stellar";
import { Server } from "@stellar/stellar-sdk/lib/horizon";
import React from "react";
import LottieView from "lottie-react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { usePushNotifications } from "@/app/notifications";

const StellarSdk = require("stellar-sdk");

const SECRET_KEY =
    "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

interface CarouselIndicatorProps {
    data: number[];
    selectedIndex: number;
}
let colorScheme: string;

const Home = ({ t }) => {
    colorScheme = useTheme().theme;
    const {
        balance: balanceWallet,
        runTransaction,
        clearTransactions,
        computeReferralCommission,
        transactions: transact,
        refer: referral,
    } = useBalanceStore();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const { user } = useUser();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [transactionsReferral, setTransactionsReferral] = useState([]);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems?.length > 0) {
            setSelectedIndex(viewableItems[0].index || 0);
        }
    }).current;
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 80,
    };

    const headerHeight = useHeaderHeight();

    // const onAddMoney = () => {
    //   runTransaction({
    //     id: Math.random().toString(),
    //     amount: Math.floor(Math.random() * 1000) * (Math.random() > 0.5 ? 1 : -1),
    //     date: new Date(),
    //     title: "Added money",
    //   });
    // };

    //PUSH NOTIFICATIONS
    //  async function requestUserPermission() {
    //   const authStatus = await messaging().requestPermission();
    //   const enabled =
    //    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //   if (enabled) {
    //    console.log("Authorization status:", authStatus);
    //   }
    //  }

    //  useEffect(() => {
    //   console.log(requestUserPermission());
    //   if (requestUserPermission()) {
    //    messaging()
    //     .getToken()
    //     .then((token) => {
    //      console.log(token);
    //     });
    //   } else {
    //    console.log("Permission not granted");
    //   }

    //   messaging()
    //    .getInitialNotification()
    //    .then(async (remoteMessage) => {
    //     if (remoteMessage) {
    //      console.log("Notifications test", remoteMessage.notification);
    //     }
    //    });

    //   messaging().onNotificationOpenedApp(async (remoteMessage) => {
    //    console.log("Notification caused", remoteMessage.notification);
    //   });

    //   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //    console.log("Message handled in the backgroun!", remoteMessage);
    //   });

    //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    //    Alert.alert("A new FCM message arrived", JSON.stringify(remoteMessage));
    //   });

    //   return unsubscribe;
    //  }, []);

    // const requestUserPermission = async () => {
    //     const authStatus = await messaging().requestPermission();
    //     const enabled =
    //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //     if (enabled) {
    //         console.log("Authorization status:", authStatus);
    //     }
    // };

    // useEffect(() => {
    //     if (requestUserPermission()) {
    //         messaging()
    //             .getToken()
    //             .then((token) => console.log(token));
    //     }

    //     // Set up the notification handler for the app
    //     Notifications.setNotificationHandler({
    //         handleNotification: async () => ({
    //             shouldShowAlert: true,
    //             shouldPlaySound: true,
    //             shouldSetBadge: false,
    //         }),
    //     });

    //     // Handle user clicking on a notification and open the screen
    //     const handleNotificationClick = async (response) => {
    //         const screen =
    //             response?.notification?.request?.content?.data?.screen;
    //         if (screen !== null) {
    //             navigation.navigate(screen);
    //         }
    //     };

    //     // Listen for user clicking on a notification
    //     const notificationClickSubscription =
    //         Notifications.addNotificationResponseReceivedListener(
    //             handleNotificationClick
    //         );

    //     // Handle user opening the app from a notification (when the app is in the background)
    //     messaging().onNotificationOpenedApp((remoteMessage) => {
    //         console.log(
    //             "Notification caused app to open from background state:",
    //             remoteMessage.data.screen,
    //             navigation
    //         );
    //         if (remoteMessage?.data?.screen) {
    //             navigation.navigate(`${remoteMessage.data.screen}`);
    //         }
    //     });

    //     // Check if the app was opened from a notification (when the app was completely quit)
    //     messaging()
    //         .getInitialNotification()
    //         .then((remoteMessage) => {
    //             if (remoteMessage) {
    //                 console.log(
    //                     "Notification caused app to open from quit state:",
    //                     remoteMessage.notification
    //                 );
    //                 if (remoteMessage?.data?.screen) {
    //                     navigation.navigate(`${remoteMessage.data.screen}`);
    //                 }
    //             }
    //         });

    //     // Handle push notifications when the app is in the background
    //     messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //         console.log("Message handled in the background!", remoteMessage);
    //         const notification = {
    //             title: remoteMessage.notification.title,
    //             body: remoteMessage.notification.body,
    //             data: remoteMessage.data, // optional data payload
    //         };

    //         // Schedule the notification with a null trigger to show immediately
    //         await Notifications.scheduleNotificationAsync({
    //             content: notification,
    //             trigger: null,
    //         });
    //     });

    //     // Handle push notifications when the app is in the foreground
    //     const handlePushNotification = async (remoteMessage) => {
    //         const notification = {
    //             title: remoteMessage.notification.title,
    //             body: remoteMessage.notification.body,
    //             data: remoteMessage.data, // optional data payload
    //         };

    //         // Schedule the notification with a null trigger to show immediately
    //         await Notifications.scheduleNotificationAsync({
    //             content: notification,
    //             trigger: null,
    //         });
    //     };

    //     // Listen for push notifications when the app is in the foreground
    //     const unsubscribe = messaging().onMessage(handlePushNotification);

    //     // Clean up the event listeners
    //     return () => {
    //         unsubscribe();
    //         notificationClickSubscription.remove();
    //     };
    // }, []);

    // useEffect(() => {
    //     // Function to get FCM token

    //     const getFCMToken = async () => {
    //         try {
    //             const token = await messaging().getToken();
    //             console.log("FCM Token:", token);
    //         } catch (error) {
    //             console.error("Error getting FCM token:", error);
    //         }
    //     };

    //     // Function to request permission for notifications
    //     const requestUserPermission = async () => {
    //         try {
    //             const authStatus = await messaging().requestPermission();
    //             const enabled =
    //                 authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //                 authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //             if (enabled) {
    //                 console.log("Authorization status:", authStatus);
    //             } else {
    //                 console.log("Permission not granted");
    //             }
    //         } catch (error) {
    //             console.error("Error requesting permission:", error);
    //         }
    //     };
    //     const registerMessagingHandlers = async () => {
    //         try {
    //             // Listen for incoming messages when the app is in the foreground
    //             const unsubscribeForeground = messaging().onMessage(
    //                 async (remoteMessage) => {
    //                     console.log("Foreground Message:", remoteMessage);
    //                     Notifications.scheduleNotificationAsync({
    //                         content: {
    //                             title: remoteMessage.notification.title,
    //                             body: remoteMessage.notification.body,
    //                             data: remoteMessage.data,
    //                         },
    //                         trigger: null, // Show immediately when received
    //                     });
    //                 }
    //             );

    //             // Clean up subscription for foreground messages
    //             const cleanupForeground = () => {
    //                 unsubscribeForeground();
    //             };

    //             // Set up handler for background messages
    //             messaging().setBackgroundMessageHandler(
    //                 async (remoteMessage) => {
    //                     console.log("Background Message:", remoteMessage);
    //                     // Handle the message here
    //                 }
    //             );

    //             // Return cleanup function
    //             return () => {
    //                 cleanupForeground();
    //             };
    //         } catch (error) {
    //             console.error("Error registering messaging handlers:", error);
    //         }
    //     };
    //     requestUserPermission();
    //     getFCMToken();
    //     // Register messaging handlers
    //     registerMessagingHandlers();
    // }, []);

    // async function schedulePushNotification() {
    //     await Notifications.scheduleNotificationAsync({
    //         content: {
    //             title: "You've got mail! 📬",
    //             body: "Here is the notification body",
    //             data: { data: "goes here", test: { test1: "more data" } },
    //         },
    //         trigger: { day: 1 },
    //     });
    // }
    const [userr, setUserr] = useState({});

    const { expoPushToken, notification } = usePushNotifications();

    // useEffect(() => {
    //     schedulePushNotification();
    // }, [notification]);
    // const data = JSON.stringify(notification, undefined, 2);
    // console.log(expoPushToken);
    useEffect(() => {
        const saveTokenToUser = async () => {
            // If expoPushToken exists, save it to the user's account in Firestore
            console.log(user?.id);
            if (
                expoPushToken &&
                user &&
                !userr?.expoPushToken &&
                userr?.expoPushToken !== expoPushToken
            ) {
                try {
                    const userId = user?.id.replace("sua_", "user_");

                    // Update the user document in Firestore with the expoPushToken
                    const userRef = await firestore()
                        .collection("users")
                        .where("userId", "<=", userId)
                        .get();

                    if (!userRef.empty) {
                        // If the user document exists, update the expoPushToken
                        const userDoc = userRef.docs[0];
                        await userDoc.ref.update({
                            expoPushToken: expoPushToken,
                        });

                        console.log(
                            "Expo push token saved to user document in Firestore"
                        );
                    } else {
                        console.log("User document not found in Firestore");
                    }
                } catch (error) {
                    console.error(
                        "Error saving expo push token to user document:",
                        error
                    );
                }
            }
        };

        saveTokenToUser();
    }, [expoPushToken, user?.id, userr]);

    useEffect(() => {
        const updateUserDocument = async () => {
            // Check if user and userr exist and userr.userId starts with "sua_"
            if (user && userr && userr.userId.startsWith("sua")) {
                try {
                    // Fetch the user document from Firestore
                    const userRef = await firestore()
                        .collection("users")
                        .where("userId", "==", userr.userId)
                        .get();

                    // Check if the user document exists
                    if (!userRef.empty) {
                        // Update the user document with the new userId
                        userRef.forEach(async (doc) => {
                            await doc.ref.update({
                                userId: user.id, // Update the userId to the original value
                            });
                        });

                        console.log("UserId Updated");
                    } else {
                        console.log("User document not found in Firestore");
                    }
                } catch (error) {
                    console.error(
                        "Error updating user document with new userId:",
                        error
                    );
                }
            }
        };

        // Call updateUserDocument whenever user?.id or userr changes
        updateUserDocument();
    }, [user?.id, userr]);

    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        const handleDeepLink = async (event) => {
            const { url } = event;
            console.log("url", url);
            if (url && user) {
                try {
                    // Parse the deep link URL and extract parameters
                    const parsedUrl = new URL(url);
                    const params = parsedUrl.searchParams;

                    // Extract the encrypted data parameter
                    const encryptedData = params.get("data");
                    if (encryptedData) {
                        // Decrypt the data
                        const bytes = CryptoJS.AES.decrypt(
                            decodeURIComponent(encryptedData),
                            "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc"
                        );
                        const decryptedData = JSON.parse(
                            bytes.toString(CryptoJS.enc.Utf8)
                        );
                        console.log(decryptedData);

                        // Navigate the user to the payment confirmation page with decrypted data
                        router.replace({
                            pathname: "/(authenticated)/(tabs)/pay",
                            params: {
                                paymentData: decryptedData,
                            },
                        });
                    } else {
                        console.error("No data parameter found in the URL");
                    }
                } catch (error) {
                    console.error("Error handling deep link:", error);
                }
            }
        };

        Linking.addEventListener("url", handleDeepLink);

        // Check if app was launched from a deep link
        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    handleDeepLink({ url });
                }
            })
            .catch((err) => console.error("An error occurred", err));

        // Cleanup the event listener
        return () => {
            Linking.removeAllListeners("url");
        };
    }, [user, router]);

    useEffect(() => {
        if (!user?.id) return; // Ensure user id is present

        // References to Firestore collections
        const transactionRef = firestore().collection("transactions");

        // Function to handle the new snapshot data
        const handleTransactionUpdate = async (querySnapshot) => {
            const newFetchedTransactions = [];
            querySnapshot.forEach((doc) => {
                let transaction = { id: doc.id, ...doc.data() };
                // Adjust the transaction amount if the user is the merchant but not the payee
                if (
                    transaction.merchantId === user?.id &&
                    transaction.payeeId !== user?.id
                ) {
                    transaction.amount = (
                        parseFloat(transaction.amount) -
                        parseFloat(transaction.fees)
                    )
                        .toFixed(2)
                        .toString();
                }
                newFetchedTransactions.push(transaction);
            });

            const transactionsWithUserData = await Promise.all(
                newFetchedTransactions.map(async (transaction) => {
                    return appendUserData(transaction);
                })
            );

            setTransactions((prevTransactions) => {
                const updatedTransactions = [...prevTransactions];
                transactionsWithUserData.forEach((tx) => {
                    const index = updatedTransactions.findIndex(
                        (item) => item.id === tx.id
                    );
                    if (index !== -1) {
                        updatedTransactions[index] = tx;
                    } else {
                        updatedTransactions.push(tx);
                    }
                });
                return updatedTransactions;
            });
        };

        const handleTransactionUpdateReferral = async (querySnapshot) => {
            const newFetchedTransactions = [];
            querySnapshot.forEach((doc) => {
                let transaction = { id: doc.id, ...doc.data() };
                // Adjust the transaction amount if the user is the merchant but not the payee
                if (
                    transaction.merchantId === user?.id &&
                    transaction.payeeId !== user?.id
                ) {
                    transaction.amount = (
                        parseFloat(transaction.amount) -
                        parseFloat(transaction.fees)
                    )
                        .toFixed(2)
                        .toString();
                }
                newFetchedTransactions.push(transaction);
            });

            const transactionsWithUserData = await Promise.all(
                newFetchedTransactions.map(async (transaction) => {
                    return appendUserData(transaction);
                })
            );

            setTransactionsReferral((prevTransactions) => {
                const updatedTransactions = [...prevTransactions];
                transactionsWithUserData.forEach((tx) => {
                    const index = updatedTransactions.findIndex(
                        (item) => item.id === tx.id
                    );
                    if (index !== -1) {
                        updatedTransactions[index] = tx;
                    } else {
                        updatedTransactions.push(tx);
                    }
                });
                return updatedTransactions;
            });
        };

        // Subscribe to changes where the user is the payee
        const unsubscribePayee = transactionRef
            .where("payeeId", "==", user.id)
            .onSnapshot(handleTransactionUpdate, (error) => {
                console.error("Error fetching payee transactions:", error);
            });

        // Subscribe to changes where the user is the merchant
        const unsubscribeMerchant = transactionRef
            .where("merchantId", "==", user.id)
            .onSnapshot(handleTransactionUpdate, (error) => {
                console.error("Error fetching merchant transactions:", error);
            });
        const unsubscribeReferral = transactionRef
            .where("referral", "==", user?.username ? user.username : user?.id)
            .onSnapshot(handleTransactionUpdateReferral, (error) => {
                console.error("Error fetching merchant transactions:", error);
            });

        // Cleanup function to unsubscribe from listeners
        return () => {
            unsubscribePayee();
            unsubscribeMerchant();
            unsubscribeReferral();
        };
    }, [user?.id]);

    useEffect(() => {
        clearTransactions();
    }, []);

    const appendUserData = async (transaction) => {
        const userRef = firestore().collection("users");
        let query = userRef.where(
            "email",
            "==",
            decodeURIComponent(
                transaction.payeeId === user?.id
                    ? transaction.merchantEmail
                    : transaction.payeeEmail
            )
        );

        const snapshot = await query.get();
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            return { ...transaction, additionalUserData: userData };
        }
        return transaction;
    };

    const handleTransactionUpdate = async (querySnapshot) => {
        const fetchedTransactions = [];
        querySnapshot.forEach((doc) => {
            let transaction = { id: doc.id, ...doc.data() };

            // Check if the user is the merchant and not the payee, then adjust the amount
            if (
                transaction.merchantId === user?.id &&
                transaction.payeeId !== user?.id
            ) {
                transaction.amount = (
                    parseFloat(transaction.amount) -
                    parseFloat(transaction.fees)
                ).toFixed(2);
            }

            fetchedTransactions.push(transaction);
        });

        // Fetch user details for each transaction
        const transactionsWithUserData = await Promise.all(
            fetchedTransactions.map(async (transaction) => {
                return appendUserData(transaction);
            })
        );

        setTransactions(transactionsWithUserData);
    };

    useEffect(() => {
        // console.log(transactions, balanceWallet());
        if (transactions?.length > 0) {
            runTransaction(transactions, user?.id!);
        }
        if (transactionsReferral?.length > 0) {
            computeReferralCommission(transactionsReferral, user?.id!);
        }
        // console.log(transactions, balanceWallet());
    }, [transactions, transactionsReferral, user?.id]);

    function updateTransactions(newTransactions) {
        setTransactions((prevTransactions) => {
            const existingIds = new Set(prevTransactions.map((tx) => tx.id));
            const filteredNewTransactions = newTransactions.filter(
                (tx) => !existingIds.has(tx.id)
            );
            return [...prevTransactions, ...filteredNewTransactions];
        });
    }

    const [wallet, setWallet] = useState({
        publicKey: "",
        secretKey: "",
    });
    const [loading, setLoading] = useState(false);
    const [walletDetails, setWalletDetails] = useState([]);

    const [showLoader, setShowLoader] = useState(false);

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (contentOffset.y <= -100) {
            setShowLoader(true);
            setTimeout(() => {
                setShowLoader(false);
            }, 2000);
        }
    };

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
    }, [setUserr]);

    // fetch wallet details only when `wallet` or `userr?.pubKey` changes
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                if (userr) {
                    const data = await getAccount(userr?.pubKey);
                    if (userr) {
                        console.log(userr?.pubKey);
                        console.log(data?.balances);
                        console.log("data", data?.balances[0].balance);

                        setWalletDetails(data?.balances);
                    } else {
                        setWalletDetails([]);
                        throw new Error("Error getting the user");
                    }
                }
            } catch (error) {
                console.error("Error fetching wallet details:", error);
                // Handle the error here, such as displaying a message to the user or logging it
            } finally {
                setLoading(false);
            }
        };
        console.log("CIao");
        fetchDetails();
        console.log("CIao2");
    }, [userr, setWalletDetails]);

    const [transactionResult, setTransactionResult] = useState(null);
    const [error, setError] = useState("");

    async function transaction() {
        const key = CryptoJS.enc.Hex.parse(
            "34e2800cde54fb848e48d24a90ef3a2904b9acfaa289f28bcc73ae3fb688aec91028b7624b8ae3341e553092827014b9a756667c204f0928ef64ee56f1cb99dc"!
        );
        // Decrypting
        const decrypted = CryptoJS.AES.decrypt(userr?.privKey, key, {
            mode: CryptoJS.mode.ECB,
        });
        const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

        const sourceSeed = privateKey;
        const destinationPublicKey =
            "GAUEBS2NHK3CEIVOS2MIV4VYXTF25ZS63GLGQDYM7MZDLYHNNL4PCFYI";
        const amountLumens = 500; // Amount of lumens to send
        const memoText = "Test";

        try {
            console.log("D");
            const sourceSecretKeyy = sourceSeed.replace('"', ""); // Only for signing the transaction
            const sourceSecretKey = sourceSecretKeyy.replace('"', "");

            await authorizeTrustline(
                sourceSecretKey,
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
            );
            // await swapXLMtoUSDC(
            //   userr.pubKey,
            //   parseFloat(walletDetails[2].balance) - 100,
            //   sourceSecretKey
            // );
            console.log("E");
            // const result = await createTransactionXDR(
            //   sourceSeed,
            //   userr?.pubKey,
            //   destinationPublicKey,
            //   amountLumens,
            //   memoText
            // );
            // console.log(result);
            // setTransactionResult(result.memo);
        } catch (err) {
            console.error("Failed to create transaction:", err);
            setError(
                "Failed to process transaction. Check console for details."
            );
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
    }

    // useEffect(() => {
    //   clearTransactions();
    // }, []);

    // useEffect(() => {
    //   if (transactions.length <= 4) {
    //     onAddMoney();
    //   }
    // }, [transactions]);
    const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({
        data,
        selectedIndex,
    }) => {
        return (
            <View style={styles.container3}>
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === selectedIndex
                                ? styles.selectedIndicator
                                : null,
                            ,
                            {
                                backgroundColor:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderContent = (selectedIndex: number) => {
        switch (selectedIndex) {
            case 0:
                return (
                    <>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "500",
                                marginTop: 30,
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                                left: 20,
                            }}
                        >
                            {i18n.t("Balance")}
                        </Text>
                        <View
                            style={[
                                styles.account,
                                {
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    backgroundColor:
                                        colorScheme === "light"
                                            ? Colors.background
                                            : Colors.dark,
                                    borderWidth: 0.5,
                                    borderColor: Colors.lightGray,
                                },
                            ]}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: 66,
                                    height: 30,
                                    top: 20,
                                    left: 10,
                                    borderRadius: 20,
                                    backgroundColor:
                                        colorScheme === "light"
                                            ? Colors.background
                                            : Colors.dark,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <Image
                                    source={{
                                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EUFOR_Roundel.svg/1024px-EUFOR_Roundel.svg.png",
                                    }}
                                    style={{ width: 26, height: 26 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    EUR
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 12,
                                    left: 15,
                                    top: 40,
                                    color:
                                        colorScheme === "light"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                {/* {balance < 0 ? i18n.t("Earnings") : i18n.t("Spending")} */}
                                {t("Balance")}
                            </Text>
                            <View style={styles.row}>
                                <Text
                                    style={[
                                        styles.balance,
                                        {
                                            color:
                                                colorScheme === "light"
                                                    ? Colors.dark
                                                    : Colors.background,
                                        },
                                    ]}
                                >
                                    {/* € {balance < 0 ? -balance.toFixed(2) : balance.toFixed(2)} */}
                                    €{" "}
                                    {walletDetails && walletDetails?.length > 0
                                        ? walletDetails
                                              .map((detail) => {
                                                  if (
                                                      detail.asset_code ===
                                                      "USDC"
                                                  ) {
                                                      return parseFloat(
                                                          detail.balance
                                                      ).toFixed(2);
                                                  }
                                                  return null;
                                              })
                                              .filter(
                                                  (balance) => balance !== null
                                              )[0] || balanceWallet().toFixed(2)
                                        : balanceWallet().toFixed(2)}
                                </Text>
                                {/* <Text style={styles.balance}>{balance}</Text> */}
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 10,
                                    margin: 12,
                                    top: 50,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "400",
                                        fontSize: 10,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    {i18n.t("Overall Spending is:")}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: 45,
                                        height: 17,
                                        top: -2,
                                        borderRadius: 20,
                                        backgroundColor: "rgba(82,220,79,0.2)",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            color: "rgba(82,220,79,1)",
                                        }}
                                    >
                                        {balanceWallet() > 0
                                            ? Math.floor(Math.random() * 100)
                                            : Math.floor(Math.random() * -100)}
                                        %
                                    </Text>
                                    <Ionicons
                                        name="arrow-up"
                                        size={12}
                                        color={"rgba(82,220,79,1)"}
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                );
            case 1:
                const cashback =
                    balanceWallet() > 0 ? balanceWallet() * 0.001 : 0;

                return (
                    <>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "500",
                                marginTop: 30,
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                                left: 20,
                            }}
                        >
                            {i18n.t("Cashback")}
                        </Text>
                        <View
                            style={[
                                styles.account,
                                {
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    backgroundColor:
                                        colorScheme === "light"
                                            ? Colors.background
                                            : Colors.dark,
                                    borderWidth: 0.5,
                                    borderColor: Colors.lightGray,
                                },
                            ]}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: 66,
                                    height: 30,
                                    top: 20,
                                    left: 10,
                                    borderRadius: 20,
                                    backgroundColor:
                                        colorScheme === "dark"
                                            ? Colors.dark
                                            : Colors.background,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <Image
                                    source={{
                                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EUFOR_Roundel.svg/1024px-EUFOR_Roundel.svg.png",
                                    }}
                                    style={{ width: 26, height: 26 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    EUR
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 12,
                                    left: 15,
                                    top: 40,
                                    color:
                                        colorScheme === "light"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                Cashback
                            </Text>
                            <View style={styles.row}>
                                <Text
                                    style={[
                                        styles.balance,
                                        {
                                            color:
                                                colorScheme === "light"
                                                    ? Colors.dark
                                                    : Colors.background,
                                        },
                                    ]}
                                >
                                    € {cashback.toFixed(3)}
                                </Text>
                                {/* <Text style={styles.balance}>{balance}</Text> */}
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 10,
                                    margin: 12,
                                    top: 50,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "400",
                                        fontSize: 10,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    {i18n.t("Overall Earnings are:")}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: 45,
                                        height: 17,
                                        top: -2,
                                        borderRadius: 20,
                                        backgroundColor: "rgba(82,220,79,0.2)",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            color: "rgba(82,220,79,1)",
                                        }}
                                    >
                                        {balanceWallet() > 0
                                            ? Math.floor(Math.random() * 100)
                                            : Math.floor(Math.random() * -100)}
                                        %
                                    </Text>
                                    <Ionicons
                                        name="arrow-up"
                                        size={12}
                                        color={"rgba(82,220,79,1)"}
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "500",
                                marginTop: 30,
                                left: 20,
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            }}
                        >
                            {i18n.t("Referral")}
                        </Text>
                        <View
                            style={[
                                styles.account,
                                {
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    backgroundColor:
                                        colorScheme === "light"
                                            ? Colors.background
                                            : Colors.dark,
                                    borderWidth: 0.5,
                                    borderColor: Colors.lightGray,
                                },
                            ]}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: 66,
                                    height: 30,
                                    top: 20,
                                    left: 10,
                                    borderRadius: 20,
                                    backgroundColor:
                                        colorScheme === "dark"
                                            ? Colors.dark
                                            : Colors.background,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <Image
                                    source={{
                                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EUFOR_Roundel.svg/1024px-EUFOR_Roundel.svg.png",
                                    }}
                                    style={{ width: 26, height: 26 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    EUR
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 12,
                                    left: 15,
                                    top: 40,
                                    color:
                                        colorScheme === "light"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                Referral
                            </Text>
                            <View style={styles.row}>
                                <Text
                                    style={[
                                        styles.balance,
                                        {
                                            color:
                                                colorScheme === "light"
                                                    ? Colors.dark
                                                    : Colors.background,
                                        },
                                    ]}
                                >
                                    {/* € {Math.floor(Math.random() * 100)} */}€{" "}
                                    {referral().toFixed(3)}
                                </Text>
                                {/* <Text style={styles.balance}>{balance}</Text> */}
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 10,
                                    margin: 12,
                                    top: 50,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "400",
                                        fontSize: 10,
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    {i18n.t("Overall Spending is:")}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: 45,
                                        height: 17,
                                        top: -2,
                                        borderRadius: 20,
                                        backgroundColor: "rgba(82,220,79,0.2)",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            color: "rgba(82,220,79,1)",
                                        }}
                                    >
                                        {balanceWallet() > 0
                                            ? Math.floor(Math.random() * 100)
                                            : Math.floor(Math.random() * -100)}
                                        %
                                    </Text>
                                    <Ionicons
                                        name="arrow-up"
                                        size={12}
                                        color={"rgba(82,220,79,1)"}
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    const animation = useRef(null);

    return (
        <ScrollView
            style={{
                backgroundColor:
                    colorScheme === "dark" ? Colors.dark : Colors.background,
            }}
            contentContainerStyle={{
                paddingTop: headerHeight,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            {/* <View
        style={[
          styles.account,
          { flexDirection: "column", alignItems: "flex-start" },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            width: 66,
            height: 30,
            top: 20,
            left: 10,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.04)",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EUFOR_Roundel.svg/1024px-EUFOR_Roundel.svg.png",
            }}
            style={{ width: 26, height: 26 }}
          />
          <Text style={{ fontSize: 14 }}>EUR</Text>
        </View>
        <Text style={{ fontSize: 12, left: 15, top: 40 }}>Spending</Text>
        <View style={styles.row}>
          <Text style={styles.balance}>€ {balance}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, margin: 12, top: 50 }}>
          <Text style={{ fontWeight: "400", fontSize: 10 }}>
            Overall Spending is:
          </Text>
          <View
            style={{
              flexDirection: "row",
              width: 45,
              height: 17,
              top: -2,
              borderRadius: 20,
              backgroundColor: "rgba(82,220,79,0.2)",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Text style={{ fontSize: 10, color: "rgba(82,220,79,1)" }}>
              {balance > 0
                ? Math.floor(Math.random() * 100)
                : Math.floor(Math.random() * -100)}
              %
            </Text>
            <Ionicons name="arrow-up" size={12} color={"rgba(82,220,79,1)"} />
          </View>
        </View>
      </View> */}
            {showLoader && (
                <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                >
                    {/* <ActivityIndicator size="large" color={Colors.primary} /> */}
                    <LottieView
                        autoPlay
                        ref={animation}
                        style={{
                            width: 50,
                            height: 50,
                            backgroundColor: "#fffff",
                        }}
                        source={require("@/assets/images/logo.json")}
                    />
                </View>
            )}
            <FlatList
                data={[0, 1, 2]}
                renderItem={({ index }) => (
                    <View
                        style={{
                            width: Dimensions.get("window").width - 120,
                        }}
                    >
                        {renderContent(index)}
                    </View>
                )}
                snapToInterval={250}
                decelerationRate="fast"
                keyExtractor={(item) => item.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            <CarouselIndicator data={[0, 1, 2]} selectedIndex={selectedIndex} />

            <View style={styles.actionRow}>
                {/* <RoundBtn icon={"add"} text={"Add money"} onPress={onAddMoney} />
        <RoundBtn
          icon={"refresh"}
          text={"Exchange"}
          onPress={clearTransactions}
        />
        <RoundBtn icon={"list"} text={"Details"} />
        <Dropdown /> */}
                <View
                    style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "center",
                    }}
                >
                    {/* <Text style={{color: 'white'}}>Hello</Text> */}
                    <TouchableOpacity
                        style={[
                            styles.buttonContainer,
                            styles.requestPayButton,
                            {
                                backgroundColor: "#FF5A5A",
                                width: 165,
                                alignItems: "center",
                                borderRadius: 20,
                            },
                        ]}
                        onPress={() => {
                            router.navigate("/(authenticated)/(tabs)/scan");
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Animated.Image
                                source={require("@/assets/images/send.png")}
                                style={{
                                    tintColor: "white",
                                    width: 25,
                                    height: 25,
                                    marginRight: 5,
                                }}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: Colors.background,
                                    },
                                ]}
                            >
                                {i18n.t("Send")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.buttonContainer,
                            styles.requestPayButton,
                            {
                                backgroundColor: "#43A047",
                                width: 165,
                                alignItems: "center",
                                borderRadius: 20,
                            },
                        ]}
                        onPress={() => {
                            router.navigate("/(authenticated)/(tabs)/request");
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Animated.Image
                                source={require("@/assets/images/request.png")}
                                style={{
                                    tintColor: "white",
                                    width: 25,
                                    height: 25,
                                    marginRight: 5,
                                }}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: Colors.background,
                                    },
                                ]}
                            >
                                {i18n.t("Request")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Text
                style={[
                    defaultStyles.sectionHeader,
                    {
                        color:
                            colorScheme === "light"
                                ? Colors.dark
                                : Colors.background,
                    },
                ]}
            >
                {i18n.t("Transactions")}
            </Text>
            {/* {transactionResult ? (
        <View>
          <Text>Transaction Result</Text>
          <Text>{JSON.stringify(transactionResult, null, 2)}</Text>
        </View>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <Text>Transaction is being processed...</Text>
      )}

      <TouchableOpacity
        onPress={async () => {
          // const data = await createWallet();
          // setLoading(true);
          // console.log(true);
          // console.log(data);
          // if (data?.source_account) {
          //   console.log(wallet);
          //   setWallet({
          //     ...wallet,
          //     publicKey: data.source_account,
          //     secretKey: data.secretKey,
          //   });
          //   console.log(wallet);
          // }
          // console.log(false);

          // setLoading(false);
          console.log("A");
          await transaction();
          console.log("B");
        }}
        disabled={loading}
      >
        <Text>Press Me</Text>
      </TouchableOpacity>
      {wallet?.publicKey && <Text>{wallet?.publicKey}</Text>}
      {wallet?.secretKey && <Text>{wallet?.secretKey}</Text>}
      {walletDetails.map((asset) => {
        return (
          <Text key={asset.asset_code}>
            {asset.balance} {asset.asset_code ? asset.asset_code : "XLM"}
          </Text>
        );
      })}
      <Text>Wallet Address: {userr?.pubKey}</Text> */}
            <View
                style={[
                    styles.transactions,
                    {
                        backgroundColor:
                            colorScheme === "light"
                                ? Colors.background
                                : Colors.dark,
                    },
                ]}
            >
                {transactions?.length === 0 && (
                    <Text style={{ padding: 14, color: Colors.gray }}>
                        {i18n.t("No transactions yet")}
                    </Text>
                )}
                {transactions
                    .sort((a, b) => {
                        // Convert dates from Firestore Timestamp to JavaScript Date objects
                        const dateA = new Date(
                            a?.timestamp?.seconds * 1000 +
                                a?.timestamp?.nanoseconds / 1000000
                        );
                        const dateB = new Date(
                            b?.timestamp?.seconds * 1000 +
                                b?.timestamp?.nanoseconds / 1000000
                        );
                        return dateB - dateA;
                    })
                    .slice(0, 4)
                    .map((transaction) => (
                        <View
                            key={transaction?.timestamp}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 16,
                            }}
                        >
                            <View style={styles.circle}>
                                <Ionicons
                                    name={
                                        transaction.reference === "deposit" &&
                                        transaction.merchantId === user?.id
                                            ? "add"
                                            : transaction.payeeId !== user?.id
                                            ? "add"
                                            : "remove"
                                    }
                                    size={24}
                                    color={Colors.dark}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontWeight: "400",
                                        color:
                                            colorScheme === "light"
                                                ? Colors.dark
                                                : Colors.background,
                                    }}
                                >
                                    {transaction.reference}
                                </Text>
                                <Text
                                    style={{ color: Colors.gray, fontSize: 12 }}
                                >
                                    {new Date(
                                        transaction?.timestamp?.seconds * 1000 +
                                            transaction?.timestamp
                                                ?.nanoseconds /
                                                1000000
                                    ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    color:
                                        colorScheme === "light"
                                            ? Colors.dark
                                            : Colors.background,
                                }}
                            >
                                {transaction.payeeId === user?.id
                                    ? transaction.amount
                                    : (
                                          parseFloat(transaction.amount) -
                                          parseFloat(transaction.fees)
                                      ).toFixed(2)}
                                €
                            </Text>
                        </View>
                    ))}
            </View>
            <View
                style={{
                    backgroundColor:
                        colorScheme === "dark"
                            ? Colors.dark
                            : Colors.background,
                    marginTop: 15,
                }}
            >
                <View
                    style={{
                        borderColor: "#F1F1F1",
                        borderWidth: 2,
                        width: 30,
                        borderRadius: 40,
                        marginLeft: "45%",
                        marginTop: 20,
                    }}
                />
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text
                        style={[
                            defaultStyles.sectionHeader,
                            {
                                color:
                                    colorScheme === "light"
                                        ? Colors.dark
                                        : Colors.background,
                            },
                        ]}
                    >
                        {i18n.t("Recent Friends")}
                    </Text>
                    <Link href={"/friends"} asChild>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "400",
                                color: "#0085FF",
                                margin: 20,
                                marginBottom: 0,
                            }}
                        >
                            {i18n.t("See all")}
                        </Text>
                    </Link>
                </View>
                <WidgetList />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    account: {
        height: 160,
        width: 275,
        borderRadius: 15,
        margin: 20,
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 10,
    },
    balance: {
        left: 15,
        top: 40,
        fontSize: 22,
        fontWeight: "bold",
    },
    currency: {
        left: 30,
        fontSize: 30,
        fontWeight: "500",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 0,
        //padding: 20
    },
    transactions: {
        marginHorizontal: 20,
        padding: 14,
        borderRadius: 16,
        gap: 20,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    container3: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 0,
        marginBottom: 20,
    },
    indicatorContainer: {
        alignItems: "center",
    },
    indicator: {
        width: 8,
        height: 3,
        borderRadius: 4,
        backgroundColor: Colors.gray,
        marginHorizontal: 4,
    },
    selectedIndicator: {
        width: 20,
    },
    buttonContainer: {
        marginLeft: 10,
        height: 60,
        alignContent: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    buttonText: {
        fontSize: 18,
    },
    requestPayButton: {
        backgroundColor: Colors.primary,
    },
});
export default Home;

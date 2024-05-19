import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@/app/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import i18n from "./translate";
import { WebView } from "react-native-webview";
import {
  createAccount,
  runDeposit,
  runDepositWatcher,
  runWithdraw,
  runWithdrawWatcher,
  getAccount,
  getInitialFunds,
  swapXLMtoUSDC,
} from "@/app/stellar/stellar";
import {
  Keypair,
  SigningKeypair,
  walletSdk,
} from "@stellar/typescript-wallet-sdk";
import CryptoJS from "crypto-js";

const Wallet = () => {
  const { user } = useUser();
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme;
  const {
    balance,
    runTransaction,
    computeReferralCommission,
    refer: referral,
    transactions: transact,
  } = useBalanceStore();

  const [transactions, setTransactions] = useState([]);
  const [transactionsReferral, setTransactionsReferral] = useState([]);
  const [walletDetails, setWalletDetails] = useState([]);
  const [wallet, setWallet] = useState({
    publicKey: "",
    secretKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [userr, setUserr] = useState({});
  const [cashback, setCashback] = useState(0);
  const [depositUrl, setDepositUrl] = useState<string | null>(null);
  const [withdrawUrl, setWithdrawUrl] = useState<string | null>(null);
  const [clientDomain, setClientDomain] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("ASDASDSADS");

  useEffect(() => {
    const fetchUser = async () => {
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
    fetchUser();
  }, [setUserr]);

  useEffect(() => {
    const fetchWalletDetails = async () => {
      setLoading(true);
      try {
        if (userr) {
          const data = await getAccount(userr?.pubKey);
          if (userr) {
            setWalletDetails(data.balances);
          } else {
            setWalletDetails([]);
            throw new Error("Error getting the user");
          }
        }
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletDetails();
  }, [userr]);

  useEffect(() => {
    const transactionRef = firestore().collection("transactions");
    const handleTransactionUpdate = async (querySnapshot) => {
      const newFetchedTransactions = [];
      querySnapshot.forEach((doc) => {
        newFetchedTransactions.push({ id: doc.id, ...doc.data() });
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
        if (
          transaction.merchantId === user?.id &&
          transaction.payeeId !== user?.id
        ) {
          transaction.amount = (
            parseFloat(transaction.amount) - parseFloat(transaction.fees)
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

    const unsubscribePayee = transactionRef
      .where("payeeId", "==", user.id)
      .onSnapshot(handleTransactionUpdate, (error) => {
        console.error("Error fetching payee transactions:", error);
      });

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

    return () => {
      unsubscribePayee();
      unsubscribeMerchant();
      unsubscribeReferral();
    };
  }, [user?.id]);

  useEffect(() => {
    if (transactions.length > 0) {
      runTransaction(transactions, user?.id!);
    }
    if (transactionsReferral.length > 0) {
      computeReferralCommission(transactionsReferral, user?.id!);
    }
  }, [transactions, transactionsReferral, user?.id]);

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

  useEffect(() => {
    const secrettt = async () => {
      if (process.env.EXPO_PUBLIC_SECRET_KEY_ENDECRYPT) {
        const key = CryptoJS.enc.Hex.parse(
          process.env.EXPO_PUBLIC_SECRET_KEY_ENDECRYPT!
        );
        // Decrypting
        const decrypted = CryptoJS.AES.decrypt(userr?.privKey, key, {
          mode: CryptoJS.mode.ECB,
        });
        const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

        setClientSecret(privateKey);
        console.log(privateKey);
      }
    };
    secrettt();
  }, [userr?.privKey]);

  const deposit10Euro = async () => {
    try {
      const key = CryptoJS.enc.Hex.parse(
        process.env.EXPO_PUBLIC_SECRET_KEY_ENDECRYPT!
      );
      // Decrypting
      const decrypted = CryptoJS.AES.decrypt(userr?.privKey, key, {
        mode: CryptoJS.mode.ECB,
      });
      const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

      const sourceSeed = privateKey;
      const sourceSecretKeyy = sourceSeed.replace('"', ""); // Only for signing the transaction
      const sourceSecretKey = sourceSecretKeyy.replace('"', "");
      const kp = SigningKeypair.fromSecret(sourceSecretKey);
      console.log(kp, clientSecret);
      const url = await runDeposit(kp, clientSecret);
      setDepositUrl(url);
      runDepositWatcher();
    } catch (error) {
      console.error("Error initiating deposit:", error);
    }
  };

  const withdraw10Euro = async () => {
    try {
      const key = CryptoJS.enc.Hex.parse(
        process.env.EXPO_PUBLIC_SECRET_KEY_ENDECRYPT!
      );
      // Decrypting
      const decrypted = CryptoJS.AES.decrypt(userr?.privKey, key, {
        mode: CryptoJS.mode.ECB,
      });
      const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

      const sourceSeed = privateKey;
      const sourceSecretKeyy = sourceSeed.replace('"', ""); // Only for signing the transaction
      const sourceSecretKey = sourceSecretKeyy.replace('"', "");
      const kp = SigningKeypair.fromSecret(sourceSecretKey);

      const url = await runWithdraw(kp, clientSecret);
      setWithdrawUrl(url);
      runWithdrawWatcher();
    } catch (error) {
      console.error("Error initiating withdrawal:", error);
    }
  };

  useEffect(() => {
    const sumPayeeTransactions = transactions.reduce((acc, curr) => {
      if (curr.payeeId === user?.id && curr.merchantId !== user?.id) {
        return acc + parseFloat(curr.amount);
      }
      return acc;
    }, 0);
    setCashback(sumPayeeTransactions * 0.005); // 0.5% of the transactions sum
  }, [transactions, user?.id]);

  if (depositUrl) {
    return (
      <>
        <WebView
          source={{ uri: depositUrl }}
          style={{ marginTop: 100, marginBottom: 50 }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            padding: 10,
            borderRadius: 5,
            position: "absolute",
            top: 150,
            right: 20,
            zIndex: 999,
          }}
          onPress={() => {
            setDepositUrl("");
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>X</Text>
        </TouchableOpacity>
      </>
    );
  }

  if (withdrawUrl) {
    return <WebView source={{ uri: withdrawUrl }} />;
  }

  return (
    <ScrollView
      style={{
        paddingTop: headerHeight,
        paddingLeft: 10,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
        height: "100%",
        alignContent: "center",
        width: "100%",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "500",
          marginTop: 30,
          left: 20,
          color: colorScheme === "dark" ? Colors.background : Colors.dark,
        }}
      >
        {i18n.t("Account")}
      </Text>
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            styles.account,
            {
              flexDirection: "column",
              alignItems: "flex-start",
              backgroundColor:
                colorScheme === "light" ? Colors.background : Colors.dark,
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
                colorScheme === "light" ? Colors.background : Colors.dark,

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
                color: colorScheme === "dark" ? Colors.background : Colors.dark,
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
              color: colorScheme === "dark" ? Colors.background : Colors.dark,
            }}
          >
            {i18n.t("Your Balance")}
          </Text>
          <View style={styles.row}>
            <Text
              style={[
                styles.balance,
                {
                  color:
                    colorScheme === "dark" ? Colors.background : Colors.dark,
                },
              ]}
            >
              €{" "}
              {walletDetails
                ? parseFloat(
                    walletDetails[
                      walletDetails
                        ? walletDetails.findIndex(
                            (balance) => balance?.asset_code === "USDC"
                          )
                        : 0
                    ]?.balance
                  )
                : balance().toFixed(2)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            console.log("Added new Wallet");
          }}
        >
          <View
            style={[
              styles.account2,
              {
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Text style={{ color: Colors.gray, fontSize: 24 }}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.wallet,
          {
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "200",
            marginTop: 10,
            color: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        >
          {i18n.t("Quply Earnings")}
        </Text>
        <View style={{ flexDirection: "row", padding: 30, gap: 20 }}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.number,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              {Math.floor(Math.random() * 1000).toFixed(2)}
            </Text>
            <Text
              style={[
                styles.text,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              Quply Coin
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.number,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              € {cashback.toFixed(3)}
            </Text>
            <Text
              style={[
                styles.text,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              {i18n.t("Cashback")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.number,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              € {referral().toFixed(3)}
            </Text>
            <Text
              style={[
                styles.text,
                {
                  color:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              {i18n.t("Referral")}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.withdraw,
          {
            marginBottom: 20,
            backgroundColor:
              colorScheme === "light" ? Colors.dark : Colors.background,
          },
        ]}
      >
        <Text
          style={{
            color: colorScheme === "light" ? Colors.background : Colors.dark,
            fontSize: 14,
            fontWeight: "300",
          }}
        >
          {i18n.t("Claim Your Earnings")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.withdraw,
          {
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/sendIcon.png")}
          style={{
            marginRight: 10,
            width: 20,
            height: 20,
            tintColor: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        />
        <Text
          style={{
            color: colorScheme === "light" ? Colors.dark : Colors.background,
            fontSize: 14,
            fontWeight: "300",
          }}
        >
          {i18n.t("Withdraw Balance")}
        </Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Client Domain"
          value={clientDomain}
          autoCapitalize="none"
          onChangeText={setClientDomain}
        />
        <TextInput
          style={styles.input}
          placeholder="Client Secret"
          value={clientSecret}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setClientSecret}
        />
      </View>
      <TouchableOpacity
        onPress={deposit10Euro}
        style={[
          styles.withdraw,
          {
            marginTop: 20,
            marginBottom: adaptiveStyle(height, {
              small: 180,
              medium: 180,
              large: 0,
            }),
            alignItems: "center",
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
          },
        ]}
      >
        <Ionicons
          name="logo-euro"
          size={22}
          style={{
            marginRight: 10,
            color: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        />
        <Text
          style={{
            color: colorScheme === "light" ? Colors.dark : Colors.background,
            fontSize: 14,
            fontWeight: "300",
          }}
        >
          {i18n.t("Deposit 10€")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={withdraw10Euro}
        style={[
          styles.withdraw,
          {
            marginTop: 20,
            marginBottom: adaptiveStyle(height, {
              small: 300,
              medium: 300,
              large: 300,
            }),
            alignItems: "center",
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
          },
        ]}
      >
        <Ionicons
          name="logo-euro"
          size={22}
          style={{
            marginRight: 10,
            color: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        />
        <Text
          style={{
            color: colorScheme === "light" ? Colors.dark : Colors.background,
            fontSize: 14,
            fontWeight: "300",
          }}
        >
          {i18n.t("Withdraw 10€")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get("window");

const adaptiveStyle = (size: number, { small, medium, large }) => {
  if (size < 350) {
    return small;
  } else if (size >= 350 && height ? size < 700 : size < 600) {
    return medium;
  } else {
    return large;
  }
};

const styles = StyleSheet.create({
  account: {
    height: 128,
    width: 275,
    borderRadius: 15,
    marginTop: 20,
    marginLeft: 20,
    alignItems: "center",
  },
  account2: {
    backgroundColor: "transparent",
    borderColor: Colors.gray,
    borderWidth: 2,
    borderStyle: "dashed",
    height: 128,
    width: 57,
    borderRadius: 15,
    margin: 20,
    alignItems: "center",
  },
  wallet: {
    flexDirection: "column",
    height: 140,
    width: 350,
    borderRadius: 15,
    marginTop: adaptiveStyle(height, { small: 0, medium: 0, large: 20 }),
    marginLeft: 20,
    alignItems: "center",
    alignContent: "center",
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
    marginTop: 5,
    fontSize: 22,
    fontWeight: "bold",
  },
  number: {
    fontSize: 18,
    fontWeight: "400",
  },
  text: {
    fontSize: 10,
    fontWeight: "200",
  },
  claim: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  withdraw: {
    width: "84%",
    height: 50,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  inputContainer: {
    margin: 20,
  },
  input: {
    height: 40,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default Wallet;

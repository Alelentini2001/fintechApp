import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";

const Wallet = ({ t }) => {
  let colorScheme = useTheme().theme;
  const { user } = useUser();
  const { balance, runTransaction, transactions: transact } = useBalanceStore();

  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.id) return; // Ensure user id is present

    // References to Firestore collections
    const transactionRef = firestore().collection("transactions");

    // Function to handle the new snapshot data
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

    // Cleanup function to unsubscribe from listeners
    return () => {
      unsubscribePayee();
      unsubscribeMerchant();
    };
  }, [user?.id]);

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
      fetchedTransactions.push({ id: doc.id, ...doc.data() });
    });

    // Fetch user details for each transaction
    const transactionsWithUserData = await Promise.all(
      fetchedTransactions.map(async (transaction) => {
        return appendUserData(transaction);
      })
    );

    setTransactions((transact) => {
      return [...transact, transactionsWithUserData];
    });
  };

  useEffect(() => {
    console.log(transactions, balance());
    if (transactions.length > 0) {
      runTransaction(transactions, user?.id!);
    }
  }, [transactions, user?.id]);

  const depositI0euro = async () => {
    try {
      await firestore().collection("transactions").add({
        amount: "10",
        fees: "",
        reference: "deposit",
        payeeUsername: "",
        merchantUsername: "",
        merchantFullName: "",
        merchantEmail: "",
        merchantPhone: "",
        userFullName: "",
        payeeId: user?.id,
        payeeEmail: "",
        payeePhoneNumber: "",
        merchantId: user?.id,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      runTransaction(transactions, user?.id!);
      //   Alert.alert("Payment Successful", "Your payment has been processed successfully.");
      Alert.alert(
        "Deposit Successful",
        "Your deposit has been processed successfully",
        [
          {
            text: "Check your homepage",
            onPress: () => {
              router.push("/(authenticated)/(tabs)/home");
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
      Alert.alert("Error", "There was a problem processing your deposit.");
    }
  };
  return (
    <View
      style={{
        paddingTop: headerHeight,
        paddingLeft: 10,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
        height: "100%",
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
              € {balance().toFixed(2)}
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
              € {(balance() * 0.005).toFixed(3)}
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
              € {Math.floor(Math.random() * 1000).toFixed(2)}
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
        <TouchableOpacity
          style={[
            styles.claim,
            {
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
      </View>
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
      <TouchableOpacity
        onPress={() => {
          depositI0euro();
        }}
        style={[
          styles.withdraw,
          {
            marginTop: 20,
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
    </View>
  );
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
    height: 190,
    width: 350,
    borderRadius: 15,
    marginTop: 20,
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
    width: "96%",
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
});

export default Wallet;

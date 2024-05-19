// src/screens/TransactionListener.tsx

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Server } from "@stellar/stellar-sdk/lib/horizon";
import { useUser } from "@clerk/clerk-expo";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { walletSdk } from "@stellar/typescript-wallet-sdk";
import { useHeaderHeight } from "@react-navigation/elements";

const server = new Server("https://horizon.stellar.org"); // Use 'https://horizon-testnet.stellar.org' for testnet

const TransactionListener = ({ t }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userr, setUserr] = useState({});
  const { user } = useUser();

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
  }, [setUserr]);

  useEffect(() => {
    if (userr?.pubKey) {
      const transactionHandler = (transaction: any) => {
        setTransactions((prevTransactions) => [
          transaction,
          ...prevTransactions,
        ]);
      };

      const stream = walletSdk.Wallet.TestNet()
        .stellar()
        .server.transactions()
        .forAccount(userr?.pubKey)
        .cursor("now")
        .stream({
          onmessage: transactionHandler,
          onerror: (error) =>
            console.error("Error in transaction stream", error),
        });

      return () => stream();
    }
  }, [userr?.pubKey]);
  const headerHeight = useHeaderHeight();

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <Text style={styles.header}>Incoming Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()} // Ensure the key is a string
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text>Transaction ID: {item.id}</Text>
            <Text>Source Account: {item.source_account}</Text>
            <Text>Created At: {item.created_at}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No transactions found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  transaction: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default TransactionListener;

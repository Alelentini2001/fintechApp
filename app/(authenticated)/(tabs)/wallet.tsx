import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import i18n from "./translate";
const Wallet = ({ t }) => {
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();
  const headerHeight = useHeaderHeight();
  return (
    <View
      style={{
        paddingTop: headerHeight,
        paddingLeft: 10,
        backgroundColor: Colors.background,
        height: "100%",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "500",
          marginTop: 30,
          left: 20,
          color: Colors.dark,
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
              backgroundColor: Colors.background,
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
            <Text style={{ fontSize: 14, color: Colors.dark }}>EUR</Text>
          </View>
          <Text style={{ fontSize: 12, left: 15, top: 40, color: Colors.dark }}>
            {i18n.t("Your Balance")}
          </Text>
          <View style={styles.row}>
            <Text style={styles.balance}>€ {balance().toFixed(2)}</Text>
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
      <View style={styles.wallet}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "200",
            marginTop: 10,
            color: Colors.dark,
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
            <Text style={styles.number}>
              {Math.floor(Math.random() * 1000).toFixed(2)}
            </Text>
            <Text style={styles.text}>Quply Coin</Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.number}>
              € {Math.floor(Math.random() * 1000).toFixed(2)}
            </Text>
            <Text style={styles.text}>{i18n.t("Cashback")}</Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.number}>
              € {Math.floor(Math.random() * 1000).toFixed(2)}
            </Text>
            <Text style={styles.text}>{i18n.t("Referral")}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.claim}>
          <Text
            style={{
              color: Colors.background,
              fontSize: 14,
              fontWeight: "300",
            }}
          >
            {i18n.t("Claim Your Earnings")}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.withdraw}>
        <Image
          source={require("@/assets/images/sendIcon.png")}
          style={{
            marginRight: 10,
            width: 20,
            height: 20,
            tintColor: Colors.dark,
          }}
        />
        <Text style={{ color: Colors.dark, fontSize: 14, fontWeight: "300" }}>
          {i18n.t("Withdraw Balance")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  account: {
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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
    color: Colors.dark,
  },
  number: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark,
  },
  text: {
    fontSize: 10,
    fontWeight: "200",
    color: Colors.dark,
  },
  claim: {
    width: "96%",
    height: 50,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  withdraw: {
    width: "84%",
    height: 50,
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
});

export default Wallet;

import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

const Stakeholder = () => {
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();
  const headerHeight = useHeaderHeight();
  return (
    <View
      style={{
        marginTop: headerHeight,
        alignItems: "center",
      }}
    >
      <Image
        source={require("@/assets/images/building.png")}
        style={{
          height: 250,
          marginLeft: 15,
          width: 275,
          marginTop: 30,
        }}
      />
      <View style={{ flexDirection: "row", gap: 5 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.gray,
            borderRadius: 15,
            width: 165,
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.gray,
              width: 157,
              borderStyle: "dashed",
              height: 62,
              borderRadius: 12,
            }}
          >
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Image
                source={require("@/assets/images/level.png")}
                alt="Direction"
                style={{
                  // tintColor: 'green',
                  marginTop: 5,
                  marginBottom: 5,
                  height: 26,
                  width: 26,
                }}
              />
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 18, color: Colors.dark }}>Level:</Text>
                <Text style={{ fontSize: 18, marginLeft: 1 }}>1</Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.gray,
            borderRadius: 15,
            width: 165,
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.gray,
              width: 157,
              borderStyle: "dashed",
              height: 62,
              borderRadius: 12,
            }}
          >
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Image
                source={require("@/assets/images/referral.png")}
                alt="Direction"
                style={{
                  // tintColor: 'green',
                  marginTop: 5,
                  marginBottom: 5,
                  height: 26,
                  width: 26,
                }}
              />
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 18, color: Colors.dark }}>
                  Referrals:
                </Text>
                <Text style={{ fontSize: 18, marginLeft: 1 }}>1</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: 335,
          height: 115,
          backgroundColor: "white",
          borderRadius: 15,
          marginTop: 10,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: Colors.dark,
            width: "96%",
            borderRadius: 15,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Daily Earnings: {Math.floor(Math.random() * 100).toFixed(2)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 5, gap: 2 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#0ABF8A",
              width: "48%",
              borderRadius: 15,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "400" }}>
              Buy Stocks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#FE6C6C",
              width: "48%",
              borderRadius: 15,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "400" }}>
              Sell Stocks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: "column",
          marginTop: 20,
          height: 160,
          width: 335,
          backgroundColor: "white",
          borderRadius: 15,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            marginTop: 10,
            fontWeight: "300",
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          Market Cap: {Math.floor(Math.random() * 1000).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: Colors.gray,
            width: "98%",
            borderRadius: 15,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.dark, fontSize: 18, fontWeight: "400" }}>
            Sell Shares of your company
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.dark,
            width: "98%",
            borderRadius: 15,
            marginTop: 5,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "400" }}>
            Buy Shares from other companies
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Stakeholder;

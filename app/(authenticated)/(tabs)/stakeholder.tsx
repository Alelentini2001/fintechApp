import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";

const Stakeholder = ({ t }) => {
  let colorScheme = useTheme().theme;
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();
  const headerHeight = useHeaderHeight();
  return (
    <View
      style={{
        paddingTop: headerHeight,
        alignItems: "center",
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
        height: "100%",
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
                <Text
                  style={{
                    fontSize: 18,
                    color:
                      colorScheme === "dark" ? Colors.background : Colors.dark,
                  }}
                >
                  {i18n.t("Level")}:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: 1,
                    color:
                      colorScheme === "dark" ? Colors.background : Colors.dark,
                  }}
                >
                  1
                </Text>
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
                <Text
                  style={{
                    fontSize: 18,
                    color:
                      colorScheme === "dark" ? Colors.background : Colors.dark,
                  }}
                >
                  {i18n.t("Referrals")}:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: 1,
                    color:
                      colorScheme === "dark" ? Colors.background : Colors.dark,
                  }}
                >
                  1
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: 335,
          height: 115,
          backgroundColor:
            colorScheme === "light" ? Colors.background : Colors.dark,
          borderRadius: 15,
          marginTop: 10,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor:
              colorScheme === "dark" ? Colors.background : Colors.dark,
            width: "96%",
            borderRadius: 15,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colorScheme === "light" ? Colors.background : Colors.dark,
            }}
          >
            {i18n.t("Daily Earnings")}:{" "}
            {Math.floor(Math.random() * 100).toFixed(2)}
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
              {i18n.t("Buy Stocks")}
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
              {i18n.t("Sell Stocks")}
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
          backgroundColor:
            colorScheme === "light" ? Colors.background : Colors.dark,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: colorScheme === "dark" ? Colors.background : Colors.dark,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            marginTop: 10,
            fontWeight: "300",
            fontSize: 12,
            marginBottom: 20,
            color: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        >
          {i18n.t("Market Cap")}: {Math.floor(Math.random() * 1000).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
            borderWidth: 1,
            borderColor: Colors.gray,
            width: "98%",
            borderRadius: 15,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colorScheme === "dark" ? Colors.background : Colors.dark,
              fontSize: 18,
              fontWeight: "400",
            }}
          >
            {i18n.t("Sell Shares of your company")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor:
              colorScheme === "dark" ? Colors.background : Colors.dark,
            width: "98%",
            borderRadius: 15,
            marginTop: 5,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colorScheme === "light" ? Colors.background : Colors.dark,
              fontSize: 18,
              fontWeight: "400",
            }}
          >
            {i18n.t("Buy Shares from other companies")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Stakeholder;

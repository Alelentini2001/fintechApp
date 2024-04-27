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
  Dimensions,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";
import { ScrollView } from "react-native-gesture-handler";
import { useUser } from "@clerk/clerk-expo";
import firestore from "@react-native-firebase/firestore";
import level1 from "@/assets/images/level1.png";
import level2 from "@/assets/images/level2.png";
import level3 from "@/assets/images/level3.png";
import level4 from "@/assets/images/level4.png";

const levelImages = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
};

const Stakeholder = ({ t }) => {
  let colorScheme = useTheme().theme;
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();
  const headerHeight = useHeaderHeight();
  const [level, setLevel] = useState(0);
  const [referrals, setReferral] = useState(0);
  const { user } = useUser();
  useEffect(() => {
    if (!user || !user.id || !user.username) return;

    // Helper function to process snapshot and update referral count and level
    const processSnapshot = (snapshot) => {
      const size = snapshot.size;
      setReferral((prev) => prev + size);
      setLevel(
        size === 0
          ? 1
          : size === 1
          ? 1
          : size >= 2 && size < 5
          ? 2
          : size >= 5 && size < 10
          ? 3
          : 4
      );
    };

    // Query for referrals by ID
    const unsubscribeId = firestore()
      .collection("users")
      .where("referral", "==", user.id)
      .onSnapshot(processSnapshot);

    // Query for referrals by Username
    const unsubscribeUsername = firestore()
      .collection("users")
      .where("referral", "==", user.username)
      .onSnapshot(processSnapshot);

    // Clean up function to unsubscribe from both queries
    return () => {
      unsubscribeId();
      unsubscribeUsername();
    };
  }, [user?.id, user?.username]);
  const imageSource = levelImages[level];

  return (
    <ScrollView
      style={{
        paddingTop: headerHeight,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
        height: "100%",
        width: "100%",
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginBottom: adaptiveStyle(height, {
            small: 170,
            medium: 170,
            large: 0,
          }),
        }}
      >
        <Image
          source={imageSource}
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
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    }}
                  >
                    {i18n.t("Level")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      marginLeft: 1,
                      color:
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    }}
                  >
                    {level}
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
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    }}
                  >
                    {i18n.t("Referrals")}:
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      marginLeft: 1,
                      color:
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    }}
                  >
                    {referrals}
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
                color:
                  colorScheme === "light" ? Colors.background : Colors.dark,
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
            borderColor:
              colorScheme === "dark" ? Colors.background : Colors.dark,
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
            {i18n.t("Market Cap")}:{" "}
            {Math.floor(Math.random() * 1000).toFixed(2)}
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
                color:
                  colorScheme === "light" ? Colors.background : Colors.dark,
                fontSize: 18,
                fontWeight: "400",
              }}
            >
              {i18n.t("Buy Shares from other companies")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get("window");

// Function to determine adaptive style based on screen size
const adaptiveStyle = (size, { small, medium, large }) => {
  if (size < 350) {
    return small;
  } else if (size >= 350 && height ? size < 700 : size < 600) {
    return medium;
  } else {
    return large;
  }
};
export default Stakeholder;

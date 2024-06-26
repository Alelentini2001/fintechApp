import { useEffect } from "react";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Clipboard,
  Share,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Currency } from "@/interfaces/crypto";
import { Link, useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import RoundBtn from "@/components/RoundBtn";
import { SIZE } from "@/components/SortableList/Config";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";
import { useUser } from "@clerk/clerk-expo";

const Crypto = ({ t }) => {
  let colorScheme = useTheme().theme;
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { user } = useUser();
  const currencies = useQuery({
    queryKey: ["currencies"],
    queryFn: () => fetch("/api/listings").then((res) => res.json()),
  });

  const ids = currencies.data
    ?.map((currency: Currency) => currency.id)
    .join(",");

  const { data } = useQuery({
    queryKey: ["info", ids],
    queryFn: () => fetch(`/api/info?ids=${ids}`).then((res) => res.json()),
    enabled: !!ids,
  });

  const CopyAlertMessage = async (message) => {
    Clipboard.setString(message);
  };

  const shareReferral = async () => {
    try {
      const result = await Share.share({
        message: `Join Quply today!! Payments has never been easier, Earn while Paying!\nJoin with this code: ${user?.id}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
      }}
      contentContainerStyle={{ paddingTop: headerHeight }}
    >
      {/* <Text style={defaultStyles.sectionHeader}>Latest Crypto</Text>
      <View style={defaultStyles.block}>
        {currencies.data?.map((currency: Currency) => (
          <Link href={`/crypto/${currency.id}`} key={currency.id} asChild>
            <TouchableOpacity
              style={{ flexDirection: "row", gap: 14, alignItems: "center" }}
            >
              <Image
                source={{ uri: data?.[currency.id].logo }}
                style={{ width: 40, height: 40 }}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontWeight: "600", color: Colors.dark }}>
                  {currency.name}
                </Text>
                <Text style={{ color: Colors.gray }}>{currency.symbol}</Text>
              </View>
              <View style={{ gap: 6, alignItems: "flex-end" }}>
                <Text>{currency.quote.EUR.price.toFixed(2)} €</Text>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <Ionicons
                    name={
                      currency.quote.EUR.percent_change_1h > 0
                        ? "arrow-up"
                        : "arrow-down"
                    }
                    size={16}
                    color={
                      currency.quote.EUR.percent_change_1h > 0 ? "green" : "red"
                    }
                  />
                  <Text
                    style={{
                      color:
                        currency.quote.EUR.percent_change_1h > 0
                          ? "green"
                          : "red",
                    }}
                  >
                    {currency.quote.EUR.percent_change_1h.toFixed(2)} %
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View> */}
      {/* <RoundBtn icon={"wallet-outline"} text="Wallet" onPress={() => {}} /> */}
      <Text
        style={{
          marginTop: adaptiveStyle(height, { small: 5, medium: 5, large: 30 }),
          marginLeft: 20,
          fontSize: 24,
          fontWeight: "600",
          color: colorScheme === "dark" ? Colors.background : Colors.dark,
        }}
      >
        {i18n.t("Applications")}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: adaptiveStyle(height, {
            small: 10,
            medium: 20,
            large: 70,
          }),
          marginLeft: 40,
          marginRight: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Wallet");
            router.navigate("/(authenticated)/(tabs)/wallet");
          }}
        >
          <View
            style={[
              styles.container,
              { alignItems: "center", justifyContent: "center" },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                height: 60,
                width: 60,
                borderRadius: 30,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              5%
            </Text> */}
              <Ionicons name="wallet-outline" size={24} color={Colors.gray} />
            </View>
            <Text
              style={{ color: Colors.gray, fontWeight: "bold", fontSize: 18 }}
            >
              {i18n.t("Wallet")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Stakeholder");
            router.navigate("/(authenticated)/(tabs)/stakeholder");
          }}
        >
          <View
            style={[
              styles.container,
              { alignItems: "center", justifyContent: "center" },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              5%
            </Text> */}
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={Colors.gray}
                />
              </View>
              <Text
                style={{ color: Colors.gray, fontWeight: "bold", fontSize: 18 }}
              >
                {i18n.t("Stakeholder")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Image
        source={require("@/assets/images/bpay_logo.png")}
        style={{
          width: 60,
          height: 60,
          left: "42%",
          marginTop: 10,
          marginBottom: 10,
          tintColor: colorScheme === "dark" ? Colors.background : Colors.dark,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginLeft: 40,
          marginRight: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Discounts");
            router.navigate("/(authenticated)/(tabs)/discounts");
          }}
        >
          <View
            style={[
              styles.container,
              { alignItems: "center", justifyContent: "center" },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              5%
            </Text> */}
                <Ionicons
                  name="pricetags-outline"
                  size={24}
                  color={Colors.gray}
                />
              </View>
              <Text
                style={{ color: Colors.gray, fontWeight: "bold", fontSize: 18 }}
              >
                {i18n.t("Discounts")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Crypto");
            router.navigate("/(authenticated)/(tabs)/crypto");
          }}
        >
          <View
            style={[
              styles.container,
              { alignItems: "center", justifyContent: "center" },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              5%
            </Text> */}
                <Ionicons name="logo-bitcoin" size={24} color={Colors.gray} />
              </View>
              <Text
                style={{ color: Colors.gray, fontWeight: "bold", fontSize: 18 }}
              >
                {i18n.t("Crypto")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          width: "80%",
          height: 50,
          backgroundColor:
            colorScheme === "light" ? Colors.dark : Colors.background,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          marginTop: adaptiveStyle(height, { small: 5, medium: 15, large: 40 }),
          marginLeft: "auto",
          marginRight: "auto",
          flexDirection: "row",
        }}
        onPress={() => {
          // Alert.alert(
          //   "Link Copied",
          //   `www.quply.it/refer/${user?.username ? user?.username : user?.id}`
          // );
          // Alert.alert(
          //   "Your Code",
          //   `www.quply.it/refer/${user?.username ? user?.username : user?.id}`,
          //   [
          //     {
          //       text: "Copy your referral code",
          //       onPress: () =>
          //         CopyAlertMessage(
          //           `www.quply.it/refer/${
          //             user?.username ? user?.username : user?.id
          //           }`
          //         ),
          //       style: "cancel",
          //     },
          //   ],
          //   { cancelable: true }
          // );
          shareReferral();
        }}
      >
        <Ionicons
          name="link"
          size={24}
          style={{ marginRight: 10 }}
          color={colorScheme === "dark" ? Colors.dark : Colors.background}
        />
        <Text
          style={{
            color: colorScheme === "dark" ? Colors.dark : Colors.background,
          }}
        >
          Invite friends or businesses
        </Text>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 150,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
    padding: 14,
    alignSelf: "center",
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default Crypto;

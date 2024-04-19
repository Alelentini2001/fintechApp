import { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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

const Crypto = () => {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
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

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
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
          marginTop: 30,
          marginLeft: 20,
          fontSize: 24,
          fontWeight: "600",
        }}
      >
        Applications
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 70,
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
              Wallet
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Stakeholder");
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
                Stakeholder
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
                Discounts
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log("Pressed Crypto");
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
                Crypto
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
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

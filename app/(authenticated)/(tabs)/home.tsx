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
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useEffect, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Link, useRouter } from "expo-router";
import i18n from "./translate";

interface CarouselIndicatorProps {
  data: number[];
  selectedIndex: number;
}

const Home = ({ t }) => {
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setSelectedIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const headerHeight = useHeaderHeight();
  const onAddMoney = () => {
    runTransaction({
      id: Math.random().toString(),
      amount: Math.floor(Math.random() * 1000) * (Math.random() > 0.5 ? 1 : -1),
      date: new Date(),
      title: "Added money",
    });
  };

  useEffect(() => {
    if (transactions.length <= 4) {
      onAddMoney();
    }
  }, [transactions]);
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
              index === selectedIndex ? styles.selectedIndicator : null,
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
              <Text style={{ fontSize: 12, left: 15, top: 40 }}>
                {i18n.t("Spending")}
              </Text>
              <View style={styles.row}>
                <Text style={styles.balance}>€ {balance().toFixed(2)}</Text>
                {/* <Text style={styles.balance}>{balance()}</Text> */}
              </View>
              <View
                style={{ flexDirection: "row", gap: 10, margin: 12, top: 50 }}
              >
                <Text style={{ fontWeight: "400", fontSize: 10 }}>
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
                  <Text style={{ fontSize: 10, color: "rgba(82,220,79,1)" }}>
                    {balance() > 0
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
        const cashback = balance() > 0 ? balance() * 0.001 : 0;

        return (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                marginTop: 30,
                left: 20,
              }}
            >
              {i18n.t("Cashback")}
            </Text>
            <View
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
              <Text style={{ fontSize: 12, left: 15, top: 40 }}>Cashback</Text>
              <View style={styles.row}>
                <Text style={styles.balance}>€ {cashback.toFixed(3)}</Text>
                {/* <Text style={styles.balance}>{balance()}</Text> */}
              </View>
              <View
                style={{ flexDirection: "row", gap: 10, margin: 12, top: 50 }}
              >
                <Text style={{ fontWeight: "400", fontSize: 10 }}>
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
                  <Text style={{ fontSize: 10, color: "rgba(82,220,79,1)" }}>
                    {balance() > 0
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
              <Text style={{ fontSize: 12, left: 15, top: 40 }}>Referral</Text>
              <View style={styles.row}>
                <Text style={styles.balance}>
                  € {Math.floor(Math.random() * 100)}
                </Text>
                {/* <Text style={styles.balance}>{balance()}</Text> */}
              </View>
              <View
                style={{ flexDirection: "row", gap: 10, margin: 12, top: 50 }}
              >
                <Text style={{ fontWeight: "400", fontSize: 10 }}>
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
                  <Text style={{ fontSize: 10, color: "rgba(82,220,79,1)" }}>
                    {balance() > 0
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

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{
        paddingTop: headerHeight,
      }}
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
          <Text style={styles.balance}>€ {balance()}</Text>
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
              {balance() > 0
                ? Math.floor(Math.random() * 100)
                : Math.floor(Math.random() * -100)}
              %
            </Text>
            <Ionicons name="arrow-up" size={12} color={"rgba(82,220,79,1)"} />
          </View>
        </View>
      </View> */}
      <FlatList
        data={[0, 1, 2]}
        renderItem={({ index }) => (
          <View style={{ width: Dimensions.get("window").width - 120 }}>
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
          style={{ flexDirection: "row", flex: 1, justifyContent: "center" }}
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Animated.Image
                source={require("@/assets/images/send.png")}
                style={{
                  tintColor: "white",
                  width: 25,
                  height: 25,
                  marginRight: 5,
                }}
              />
              <Text style={styles.buttonText}> {i18n.t("Send")}</Text>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Animated.Image
                source={require("@/assets/images/request.png")}
                style={{
                  tintColor: "white",
                  width: 25,
                  height: 25,
                  marginRight: 5,
                }}
              />
              <Text style={styles.buttonText}> {i18n.t("Request")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={defaultStyles.sectionHeader}>{i18n.t("Transactions")}</Text>
      <View style={styles.transactions}>
        {transactions.length === 0 && (
          <Text style={{ padding: 14, color: Colors.gray }}>
            {i18n.t("No transactions yet")}
          </Text>
        )}
        {transactions.reverse().map((transaction) => (
          <View
            key={transaction.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View style={styles.circle}>
              <Ionicons
                name={transaction.amount > 0 ? "add" : "remove"}
                size={24}
                color={Colors.dark}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "400" }}>{transaction.title}</Text>
              <Text style={{ color: Colors.gray, fontSize: 12 }}>
                {transaction.date.toLocaleString()}
              </Text>
            </View>
            <Text>{transaction.amount.toFixed(2)}€</Text>
          </View>
        ))}
      </View>
      <View
        style={{
          backgroundColor: "white",
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={defaultStyles.sectionHeader}>
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
    backgroundColor: "white",
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
    backgroundColor: "#fff",
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
    backgroundColor: "gray",
    marginHorizontal: 4,
  },
  selectedIndicator: {
    width: 20,
    backgroundColor: "black",
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
    color: "white",
  },
  requestPayButton: {
    backgroundColor: "blue",
  },
});
export default Home;

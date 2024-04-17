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
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

const Home = () => {
  const { balance, runTransaction, transactions, clearTransactions } =
    useBalanceStore();

  const headerHeight = useHeaderHeight();
  const onAddMoney = () => {
    runTransaction({
      id: Math.random().toString(),
      amount: Math.floor(Math.random() * 1000) * (Math.random() > 0.5 ? 1 : -1),
      date: new Date(),
      title: "Added money",
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{
        paddingTop: headerHeight,
      }}
    >
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
        <Text style={{ fontSize: 12, left: 15, top: 40 }}>Spending</Text>
        <View style={styles.row}>
          <Text style={styles.balance}>€ {balance()}</Text>
          {/* <Text style={styles.balance}>{balance()}</Text> */}
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
      </View>
      <View style={styles.actionRow}>
        <RoundBtn icon={"add"} text={"Add money"} onPress={onAddMoney} />
        <RoundBtn
          icon={"refresh"}
          text={"Exchange"}
          onPress={clearTransactions}
        />
        <RoundBtn icon={"list"} text={"Details"} />
        <Dropdown />
      </View>
      <Text style={defaultStyles.sectionHeader}>Transactions</Text>
      <View style={styles.transactions}>
        {transactions.length === 0 && (
          <Text style={{ padding: 14, color: Colors.gray }}>
            No transactions yet
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
            <Text>{transaction.amount}€</Text>
          </View>
        ))}
      </View>
      <Text style={defaultStyles.sectionHeader}>Widgets</Text>
      <WidgetList />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  account: {
    backgroundColor: "white",
    height: 160,
    width: 275,
    borderRadius: 15,
    margin: 80,
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
    padding: 20,
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
});
export default Home;

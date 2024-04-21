import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import * as DropdownMenu from "zeego/dropdown-menu";
import i18n from "./translate";

const Page = ({ t }) => {
  const headerHeight = useHeaderHeight();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("date"); // Default sort by date

  useEffect(() => {
    const generateTransactions = () => {
      const unsortedTransactions = Array.from({ length: 18 }, () => ({
        id: faker.number.int(),
        avatar: faker.image.avatar(),
        name: faker.person.fullName(),
        date: new Date(faker.date.recent().toISOString()), // Change to Date object for easier comparison
        price: parseFloat((Math.random() * 100).toFixed(2)), // Generate random prices
      }));
      unsortedTransactions.push({
        id: "ale",
        avatar: faker.image.avatar(),
        name: "Alessandro Lentini",
        date: new Date(),
        price: -3.25,
      });
      // Sorting the transactions by date
      return unsortedTransactions.sort((a, b) => b.date - a.date); // Descending order
    };
    setTransactions(generateTransactions());
  }, []);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSort = (key: string) => {
    setSortKey(key);
  };

  const sortedTransactions = transactions
    .sort((a, b) => {
      if (sortKey === "date") {
        return b.date - a.date;
      } else if (sortKey === "price") {
        return b.price - a.price;
      } else if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      }
    })
    .filter((transaction) =>
      transaction.name.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <ScrollView
      style={{
        paddingTop: headerHeight,
        paddingLeft: 20,
        backgroundColor: Colors.background,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t("Transactions")}</Text>
      </View>
      <View style={{ flexDirection: "row", padding: 5 }}>
        <View style={styles.searchSelection}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.dark}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={i18n.t("Search")}
            placeholderTextColor={Colors.dark}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>

        {/* <View style={styles.circle}>
          <Ionicons name="filter-outline" size={24} color={"white"} />
          
        </View> */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View style={styles.circle}>
              <Ionicons
                name="filter-outline"
                size={24}
                color={Colors.background}
              />
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key="date" onSelect={() => handleSort("date")}>
              <DropdownMenu.ItemTitle>{i18n.t("Date")}</DropdownMenu.ItemTitle>
              <DropdownMenu.ItemIcon
                ios={{ name: "calendar", pointSize: 24 }}
              />
            </DropdownMenu.Item>
            <DropdownMenu.Item key="price" onSelect={() => handleSort("price")}>
              <DropdownMenu.ItemTitle>{i18n.t("Price")}</DropdownMenu.ItemTitle>
              <DropdownMenu.ItemIcon
                ios={{ name: "eurosign.circle", pointSize: 24 }}
              />
            </DropdownMenu.Item>
            <DropdownMenu.Item key="name" onSelect={() => handleSort("name")}>
              <DropdownMenu.ItemTitle>{i18n.t("Name")}</DropdownMenu.ItemTitle>
              <DropdownMenu.ItemIcon
                ios={{ name: "person.circle", pointSize: 24 }}
              />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
      <View
        style={{
          flexDirection: "column",
          marginTop: 10,
        }}
      >
        {/* <View
          key={"test"}
          style={{
            flexDirection: "row",
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <View
            style={[styles.circle, { overflow: "hidden", marginRight: 10 }]}
          >
            <Image
              source={{ uri: "" }}
              style={{ width: "100%", height: "100%", borderRadius: 30 }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Text style={[styles.name, { color: Colors.dark }]}>
              Alessandro Lentini
            </Text>
            <Text style={[styles.date, { color: Colors.dark }]}>
              Fri, 19 Apr 2024 14:58:21 GMT
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text
            style={[styles.price, { color: "#FF6868" }]}
          >{`${"-"}€${3.98}`}</Text>
        </View> */}
        <View
          style={{ flexDirection: "column", marginTop: 10, marginBottom: 100 }}
        >
          {sortedTransactions.map((transaction) => (
            <View
              key={transaction.id}
              style={{
                flexDirection: "row",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <View
                style={[styles.circle, { overflow: "hidden", marginRight: 10 }]}
              >
                <Image
                  source={{ uri: transaction.avatar }}
                  style={{ width: "100%", height: "100%", borderRadius: 30 }}
                />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Text style={[styles.name, { color: Colors.dark }]}>
                  {transaction.name}
                </Text>
                <Text style={[styles.date, { color: Colors.dark }]}>
                  {transaction.date.toLocaleString()}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.price,
                  { color: transaction.price > 0 ? "#0ABF8A" : "#FF6868" },
                ]}
              >{`${
                transaction.price > 0 ? "+" : "-"
              }€${transaction.price.toFixed(2)}`}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: "400",
    marginBottom: 20,
    color: Colors.dark,
  },
  searchSelection: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 30,
    alignItems: "center",
    marginRight: 20,
    borderColor: Colors.dark,
    borderWidth: 1,
    justifyContent: "center",
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    color: Colors.dark,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 70,
    marginRight: 10,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 14, fontWeight: "400" },
  date: { fontSize: 10, fontWeight: "400" },
  price: { marginRight: 20, fontSize: 16, fontWeight: "600" },
});

export default Page;

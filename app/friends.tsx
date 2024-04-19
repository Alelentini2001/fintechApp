import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";

const Friends = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [sortKey, setSortKey] = useState<boolean>(false); // Default sort by date

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

  const handleSort = (key: boolean) => {
    setSortKey(key);
  };

  const sortedTransactions = transactions
    .sort((a, b) => {
      if (sortKey) {
        //up
        return a.name.localeCompare(b.name);
      } else {
        //down
        return b.name.localeCompare(a.name);
      }
    })
    .filter((transaction) =>
      transaction.name.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: "row", padding: 5, gap: 10 }}>
        <View style={styles.searchSelection}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.dark}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search"
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
              <Ionicons name="filter-outline" size={24} color="white" />
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key="name" onSelect={() => handleSort(!sortKey)}>
              <DropdownMenu.ItemTitle>Name</DropdownMenu.ItemTitle>
              <DropdownMenu.ItemIcon
                ios={{
                  name: !sortKey ? "chevron.up" : "chevron.down",
                  pointSize: 24,
                }}
              />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
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
              {/* <Text style={[styles.date, { color: Colors.dark }]}>
                {transaction.date.toUTCString()}
              </Text> */}
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={{
                width: 80,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.dark,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "white" }}>Pay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },

  searchSelection: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    borderRadius: 30,
    alignItems: "center",
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
    marginRight: 0,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 14, fontWeight: "400" },
  date: { fontSize: 10, fontWeight: "400" },
  price: { marginRight: 20, fontSize: 16, fontWeight: "600" },
});

export default Friends;

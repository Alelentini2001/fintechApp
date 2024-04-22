import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import * as DropdownMenu from "zeego/dropdown-menu";
import i18n from "./translate";
import { useTheme } from "@/app/ThemeContext";
import { useUser, useClerk } from "@clerk/clerk-expo";

import firestore, { firebase } from "@react-native-firebase/firestore";

let colorScheme: any;
const Page = ({ t }) => {
  colorScheme = useTheme().theme;
  const headerHeight = useHeaderHeight();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("date"); // Default sort by date
  const { user } = useUser();
  // useEffect(() => {
  //   const generateTransactions = () => {
  //     const unsortedTransactions = Array.from({ length: 18 }, () => ({
  //       id: faker.number.int(),
  //       avatar: faker.image.avatar(),
  //       name: faker.person.fullName(),
  //       date: new Date(faker.date.recent().toISOString()), // Change to Date object for easier comparison
  //       price: parseFloat((Math.random() * 100).toFixed(2)), // Generate random prices
  //     }));
  //     unsortedTransactions.push({
  //       id: "ale",
  //       avatar: faker.image.avatar(),
  //       name: "Alessandro Lentini",
  //       date: new Date(),
  //       price: -3.25,
  //     });
  //     // Sorting the transactions by date
  //     return unsortedTransactions.sort((a, b) => b.date - a.date); // Descending order
  //   };
  //   setTransactions(generateTransactions());
  // }, []);
  const fetchTransactions = async () => {
    if (!user?.id) return; // Ensure there is a user id to query against

    // Fetch all transactions where the user is either a payee or a merchant
    const transactionRef = firestore().collection("transactions");
    const querySnapshotPayee = await transactionRef
      .where("payeeId", "==", user.id)
      .get();

    // Fetch all transactions where the user is the merchant
    const querySnapshotMerchant = await transactionRef
      .where("merchantId", "==", user.id)
      .get();

    let transactions = []; // Initialize the array to hold combined transactions

    // Process payee transactions
    querySnapshotPayee.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    // Process merchant transactions, avoiding duplicates
    querySnapshotMerchant.forEach((doc) => {
      if (!transactions.find((t) => t.id === doc.id)) {
        transactions.push({ id: doc.id, ...doc.data() });
      }
    });

    if (transactions.length === 0) {
      console.log("No transactions found as payee or merchant");
      return; // Exit if no transactions are found
    }

    const fetchedTransactions = transactions;
    const updatedTransactions = await Promise.all(
      fetchedTransactions.map(async (transaction) => {
        // Decide which details to fetch based on the transaction role
        let targetRef;

        const merchantEmail = decodeURIComponent(transaction.merchantEmail);
        const payeeEmail = decodeURIComponent(transaction.payeeEmail);
        const merchantPhoneNumber = decodeURIComponent(
          transaction.merchantPhoneNumber
        );
        const payeePhoneNumber = decodeURIComponent(
          transaction.payeePhoneNumber
        );

        if (transaction.payeeId === user?.id) {
          // User is the payee; fetch merchant details by email or phone
          targetRef = firestore()
            .collection("users")
            .where("email", "==", merchantEmail)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
              }
              // If no result found by email, try by phone
              return firestore()
                .collection("users")
                .where("phone", "==", merchantPhoneNumber)
                .get()
                .then((phoneSnapshot) => {
                  if (!phoneSnapshot.empty) {
                    return phoneSnapshot.docs[0].data();
                  }
                  return null; // No user data found
                });
            });
        } else {
          // User is the merchant; assume you fetch payee details similarly
          targetRef = firestore()
            .collection("users")
            .where("username", "==", payeeEmail)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
              }
              // If no result found by email, try by phone
              return firestore()
                .collection("users")
                .where("phone", "==", payeePhoneNumber)
                .get()
                .then((phoneSnapshot) => {
                  if (!phoneSnapshot.empty) {
                    return phoneSnapshot.docs[0].data();
                  }
                  return null; // No user data found
                });
            });
        }

        const additionalUserData = await targetRef;
        return { ...transaction, additionalUserData }; // Append additional user data to the transaction
      })
    );
    setTransactions(updatedTransactions); // Update state with transactions including additional user data
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id]);

  const filteredTransactions = transactions.filter((transaction) =>
    (transaction.payeeId === user?.id
      ? transaction?.merchantFullName
      : transaction?.userFullName
    )
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handleSort = (key: string) => {
    setSortKey(key);
  };

  const sortedTransactions = transactions
    .filter((transaction) => {
      // Determine the correct name field to use based on whether the user is the payee
      const nameToCheck =
        transaction.payeeId === user?.id
          ? transaction.merchantFullName
          : transaction.userFullName;

      // Check if the name contains the search text
      return nameToCheck.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
      // Convert dates from Firestore Timestamp to JavaScript Date objects
      const dateA = new Date(a.timestamp.seconds * 1000);
      const dateB = new Date(b.timestamp.seconds * 1000);

      // Sorting logic based on the selected key
      if (sortKey === "date") {
        return dateB - dateA; // Sort by date descending
      } else if (sortKey === "price") {
        return parseFloat(b.amount) - parseFloat(a.amount); // Sort by amount descending
      } else if (sortKey === "name") {
        // Use a consistent name field for sorting, depending on the transaction's context
        const nameA =
          a.payeeId === user?.id ? a.merchantFullName : a.userFullName;
        const nameB =
          a.payeeId === user?.id ? b.merchantFullName : b.userFullName;
        return nameA.localeCompare(nameB); // Sort by name alphabetically
      }
    });

  return (
    <ScrollView
      style={{
        paddingTop: headerHeight,
        paddingLeft: 20,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
      }}
    >
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: colorScheme === "dark" ? Colors.background : Colors.dark },
          ]}
        >
          {i18n.t("Transactions")}
        </Text>
      </View>
      <View style={{ flexDirection: "row", padding: 5 }}>
        <View
          style={[
            styles.searchSelection,
            {
              backgroundColor:
                colorScheme === "light" ? Colors.background : Colors.dark,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colorScheme === "dark" ? Colors.background : Colors.dark}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.input,
              {
                color:
                  colorScheme === "light" ? Colors.dark : Colors.background,
              },
            ]}
            placeholder={i18n.t("Search")}
            placeholderTextColor={
              colorScheme === "light" ? Colors.dark : Colors.background
            }
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>

        {/* <View style={styles.circle}>
          <Ionicons name="filter-outline" size={24} color={"white"} />
          
        </View> */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor:
                    colorScheme === "light" ? Colors.dark : Colors.background,
                },
              ]}
            >
              <Ionicons
                name="filter-outline"
                size={24}
                color={
                  colorScheme === "light" ? Colors.background : Colors.dark
                }
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
                  source={{ uri: transaction?.additionalUserData?.avatar }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 30,
                    borderColor: Colors.gray,
                    borderWidth: 0.5,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Text
                  style={[
                    styles.name,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    },
                  ]}
                >
                  {transaction.payeeId === user?.id
                    ? transaction?.merchantFullName.split("+")[0] +
                      " " +
                      transaction?.merchantFullName.split("+")[1]
                    : transaction?.userFullName}
                </Text>
                <Text
                  style={[
                    styles.date,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.background
                          : Colors.dark,
                    },
                  ]}
                >
                  {new Date(
                    transaction.timestamp.seconds * 1000 +
                      transaction.timestamp.nanoseconds / 1000000
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.price,
                  {
                    color:
                      transaction.payeeId !== user?.id ? "#0ABF8A" : "#FF6868",
                  },
                ]}
              >{`${transaction.payeeId !== user?.id ? "+" : "-"}€${parseFloat(
                transaction.payeeId === user?.id
                  ? transaction.amount
                  : parseFloat(transaction.amount) -
                      parseFloat(transaction.fees)
              ).toFixed(2)}`}</Text>
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
  },
  searchSelection: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 30,
    alignItems: "center",
    marginRight: 20,
    borderColor: Colors.gray,
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
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 70,
    marginRight: 10,

    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 14, fontWeight: "400" },
  date: { fontSize: 10, fontWeight: "400" },
  price: { marginRight: 20, fontSize: 16, fontWeight: "600" },
});

export default Page;

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
  useEffect(() => {
    if (!user?.id) return; // Ensure user id is present

    // References to Firestore collections
    const transactionRef = firestore().collection("transactions");

    // Function to handle the new snapshot data
    const handleTransactionUpdate = async (querySnapshot) => {
      const newFetchedTransactions = [];
      querySnapshot.forEach((doc) => {
        newFetchedTransactions.push({ id: doc.id, ...doc.data() });
      });

      const transactionsWithUserData = await Promise.all(
        newFetchedTransactions.map(async (transaction) => {
          return appendUserData(transaction);
        })
      );

      setTransactions((prevTransactions) => {
        const updatedTransactions = [...prevTransactions];
        transactionsWithUserData.forEach((tx) => {
          const index = updatedTransactions.findIndex(
            (item) => item.id === tx.id
          );
          if (index !== -1) {
            updatedTransactions[index] = tx;
          } else {
            updatedTransactions.push(tx);
          }
        });
        return updatedTransactions;
      });
    };

    // Subscribe to changes where the user is the payee
    const unsubscribePayee = transactionRef
      .where("payeeId", "==", user.id)
      .onSnapshot(handleTransactionUpdate, (error) => {
        console.error("Error fetching payee transactions:", error);
      });

    // Subscribe to changes where the user is the merchant
    const unsubscribeMerchant = transactionRef
      .where("merchantId", "==", user.id)
      .onSnapshot(handleTransactionUpdate, (error) => {
        console.error("Error fetching merchant transactions:", error);
      });

    // Cleanup function to unsubscribe from listeners
    return () => {
      unsubscribePayee();
      unsubscribeMerchant();
    };
  }, [user?.id]);

  const appendUserData = async (transaction) => {
    const userRef = firestore().collection("users");
    let query = userRef.where(
      "email",
      "==",
      decodeURIComponent(
        transaction.payeeId === user?.id
          ? transaction.merchantEmail
          : transaction.payeeEmail
      )
    );

    const snapshot = await query.get();
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      return { ...transaction, additionalUserData: userData };
    }
    return transaction;
  };

  const handleTransactionUpdate = async (querySnapshot) => {
    const fetchedTransactions = [];
    querySnapshot.forEach((doc) => {
      fetchedTransactions.push({ id: doc.id, ...doc.data() });
    });

    // Fetch user details for each transaction
    const transactionsWithUserData = await Promise.all(
      fetchedTransactions.map(async (transaction) => {
        return appendUserData(transaction);
      })
    );

    setTransactions(transactionsWithUserData);
  };

  // const appendUserData = async (transaction) => {
  //   // Fetch user data based on whether the user is the payee or the merchant
  //   const userRef = firestore().collection("users");
  //   let query;

  //   if (transaction.payeeId === user?.id) {
  //     query = userRef.where(
  //       "email",
  //       "==",
  //       decodeURIComponent(transaction.merchantEmail)
  //     );
  //   } else {
  //     query = userRef.where(
  //       "email",
  //       "==",
  //       decodeURIComponent(transaction.payeeEmail)
  //     );
  //   }

  //   const snapshot = await query.get();
  //   if (!snapshot.empty) {
  //     const userData = snapshot.docs[0].data();
  //     return { ...transaction, additionalUserData: userData };
  //   }

  //   return transaction; // Return transaction unchanged if user data is not found
  // };

  // useEffect(() => {
  //   fetchTransactions();
  // }, [user?.id]);

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
      const dateA = new Date(a?.timestamp?.seconds * 1000);
      const dateB = new Date(b?.timestamp?.seconds * 1000);

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
        marginTop: headerHeight,
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
                  source={{
                    uri:
                      transaction.reference === "deposit" &&
                      transaction.merchantId === user?.id
                        ? user?.imageUrl
                        : transaction?.additionalUserData?.avatar,
                  }}
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
                  {transaction.reference === "deposit" &&
                  transaction.merchantId === user?.id
                    ? "Deposit"
                    : transaction.payeeId === user?.id
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
                    transaction?.timestamp?.seconds * 1000 +
                      transaction?.timestamp?.nanoseconds / 1000000
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
                      transaction.reference === "deposit" &&
                      transaction.merchantId === user?.id
                        ? "#0ABF8A"
                        : transaction.payeeId !== user?.id
                        ? "#0ABF8A"
                        : "#FF6868",
                  },
                ]}
              >{`${
                transaction.reference === "deposit" &&
                transaction.merchantId === user?.id
                  ? "+"
                  : transaction.payeeId !== user?.id
                  ? "+"
                  : "-"
              }€${parseFloat(
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

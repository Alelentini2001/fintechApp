import React, { useState } from "react";
import { StyleSheet, View, Text, Image } from "react-native";

import { SIZE } from "./Config";
import Colors from "@/constants/Colors";
import { useBalanceStore } from "@/store/balanceStore";
import { Ionicons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";

const styles = StyleSheet.create({
  container: {
    width: SIZE - 20,
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

interface TileProps {
  id: string;
  onLongPress: () => void;
}

const Tile = ({ id }: TileProps) => {
  const { transactions } = useBalanceStore();
  const generateFakeAvatar = faker.image.avatar();
  return (
    <View style={[styles.circle, { overflow: "hidden" }]}>
      <Image
        source={{ uri: generateFakeAvatar }}
        style={{ width: "100%", height: "100%", borderRadius: 30 }} // Apply borderRadius here as well
      />
    </View>
  );
  if (id === "spent") {
    return (
      // <View style={styles.container} pointerEvents="none">
      //   <Text style={{ color: Colors.gray, fontWeight: "500", fontSize: 16 }}>
      //     Spent this month
      //   </Text>
      //   <Text
      //     style={{
      //       color: Colors.dark,
      //       fontWeight: "bold",
      //       fontSize: 26,
      //       paddingTop: 10,
      //     }}
      //   >
      //     1024€
      //   </Text>
      // </View>
      <View style={[styles.circle, { overflow: "hidden" }]}>
        <Image
          source={{ uri: generateFakeAvatar }}
          style={{ width: "100%", height: "100%", borderRadius: 30 }} // Apply borderRadius here as well
        />
      </View>
    );
  }

  if (id === "cashback") {
    return (
      // <View
      //   style={[
      //     styles.container,
      //     { alignItems: "center", justifyContent: "center" },
      //   ]}
      //   pointerEvents="none"
      // >
      //   <View
      //     style={{ alignItems: "center", justifyContent: "center", gap: 10 }}
      //   >
      //     <View
      //       style={{
      //         height: 60,
      //         width: 60,
      //         borderRadius: 30,
      //         backgroundColor: Colors.primary,
      //         alignItems: "center",
      //         justifyContent: "center",
      //       }}
      //     >
      //       <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
      //         5%
      //       </Text>
      //     </View>
      //     <Text
      //       style={{ color: Colors.gray, fontWeight: "bold", fontSize: 18 }}
      //     >
      //       Cashback
      //     </Text>
      //   </View>
      // </View>
      <View style={[styles.circle, { overflow: "hidden" }]}>
        <Image
          source={{ uri: generateFakeAvatar }}
          style={{ width: "100%", height: "100%", borderRadius: 30 }} // Apply borderRadius here as well
        />
      </View>
    );
  }

  if (id === "recent") {
    return (
      // <View style={styles.container} pointerEvents="none">
      //   <View>
      //     <Text style={{ color: Colors.gray, fontWeight: "500", fontSize: 16 }}>
      //       Recent transaction
      //     </Text>

      //     {transactions.length === 0 && (
      //       <Text
      //         style={{
      //           color: Colors.gray,
      //           fontWeight: "bold",
      //           fontSize: 18,
      //           paddingTop: 10,
      //         }}
      //       >
      //         No transactions
      //       </Text>
      //     )}

      //     {transactions.length > 0 && (
      //       <>
      //         <Text
      //           style={{
      //             color: Colors.dark,
      //             fontWeight: "bold",
      //             fontSize: 18,
      //             paddingVertical: 10,
      //           }}
      //         >
      //           {transactions[transactions.length - 1].amount}€
      //         </Text>
      //         <Text
      //           style={{ color: Colors.gray, fontWeight: "bold", fontSize: 16 }}
      //         >
      //           {transactions[transactions.length - 1].title}
      //         </Text>
      //       </>
      //     )}
      //   </View>
      // </View>
      <View style={[styles.circle, { overflow: "hidden" }]}>
        <Image
          source={{ uri: generateFakeAvatar }}
          style={{ width: "100%", height: "100%", borderRadius: 30 }} // Apply borderRadius here as well
        />
      </View>
    );
  }

  if (id === "cards") {
    return (
      // <View style={styles.container} pointerEvents="none">
      //   <Text style={{ color: Colors.gray, fontWeight: "500", fontSize: 16 }}>
      //     Cards
      //   </Text>
      //   <Ionicons
      //     name="card"
      //     size={50}
      //     color={Colors.primaryMuted}
      //     style={{ marginTop: 20, alignSelf: "center" }}
      //   />
      // </View>
      <View style={[styles.circle, { overflow: "hidden" }]}>
        <Image
          source={{ uri: generateFakeAvatar }}
          style={{ width: "100%", height: "100%", borderRadius: 30 }} // Apply borderRadius here as well
        />
      </View>
    );
  }
};

export default Tile;

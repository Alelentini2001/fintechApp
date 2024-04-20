import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import i18n from "@/app/(authenticated)/(tabs)/translate";

const CustomHeader = () => {
  const { top } = useSafeAreaInsets();
  const { user } = useUser();

  return (
    <BlurView intensity={80} tint={"extraLight"} style={{ paddingTop: top }}>
      <View style={styles.container}>
        {/* <Link href={"/(authenticated)/(modals)/account"} asChild> */}
        {user?.imageUrl ? (
          <View style={styles.roundBtn}>
            <Image style={styles.roundBtn} source={{ uri: user?.imageUrl }} />
          </View>
        ) : (
          <View style={styles.roundBtn}>
            <Text style={{ color: "#fff", fontWeight: "500", fontSize: 16 }}>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </Text>
          </View>
        )}
        {/* </Link> */}
        {/* <View style={styles.searchSelection}>
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
          />
        </View> */}
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View>
            <Text style={styles.greetingText}>
              {new Date().getHours() >= 12 && new Date().getHours() < 24
                ? i18n.t("Good Afternoon")
                : i18n.t("Good Morning")}
            </Text>
          </View>
          <View>
            {user?.fullName ? (
              <Text
                style={styles.userName}
                numberOfLines={1} // Restrict to one line
                ellipsizeMode="tail" // Show ellipsis (...) at the end if the text is too long
              >
                {user?.fullName}
              </Text>
            ) : (
              <Text
                style={styles.userName}
                numberOfLines={1} // Restrict to one line
                ellipsizeMode="tail" // Show ellipsis (...) at the end if the text is too long
              >
                {user?.id}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.circle}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={Colors.dark}
          />
        </View>
        {/* <View style={styles.circle}>
          <Ionicons name="card" size={20} color={Colors.dark} />
        </View> */}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    height: 60,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray,
    justifyContent: "center",
    alignItems: "center",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    marginRight: 0,
  },
  greetingText: {
    fontSize: 12,
    color: "black",
  },
  userNameContainer: {
    marginLeft: 0,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});
export default CustomHeader;

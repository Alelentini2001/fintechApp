import { useTheme } from "@/app/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";

const Discounts = ({ t }) => {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme;
  return (
    <ScrollView
      style={{
        paddingTop: headerHeight,
        paddingLeft: 10,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
        height: "100%",
        alignContent: "center",
        width: "100%",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "500",
          marginTop: 30,
          left: 20,
          color: colorScheme === "dark" ? Colors.background : Colors.dark,
        }}
      >
        {t("Discounts")}
      </Text>
    </ScrollView>
  );
};

export default Discounts;

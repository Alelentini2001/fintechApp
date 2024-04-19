import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { BlurView } from "expo-blur";
import CustomHeader from "@/components/CustomHeader";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import HomeMainScreen from "./home";
import InvestScreen from "./invest";
import TransactionScreen from "./transactions";
import Apps from "./apps";
import LifestyleScreen from "./lifestyle";
import Colors from "@/constants/Colors";
import Animated from "react-native-reanimated";
import ActionButton from "react-native-action-button";
import { NavigationContainerRef } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Scan from "./scan";
import Wallet from "./wallet";
import Stakeholder from "./stakeholder";
import Crypto from "./crypto";

const Slider = () => {
  //   const onPressStakeholder = () => {
  //     // Navigate to 'StakeholderScreen'
  //     navigationRef.current?.navigate("StakeholderView");
  //   };
  const router = useRouter();

  return (
    <View
      style={{
        marginRight: 15,
      }}
    >
      <ActionButton
        buttonColor="white"
        onPress={() => {
          console.log("Press");
          router.replace("/(authenticated)/(tabs)/scan");
        }}
        renderIcon={() => (
          <Image
            source={require("@/assets/images/bpay_logo.png")}
            style={{
              tintColor: "black",
              width: 30,
              height: 30,
              marginRight: 2,
            }}
          />
        )}
        degrees={0}
      ></ActionButton>
    </View>
  );
};

const Layout = () => {
  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    const isSelected = routeName === selectedTab;
    const color = isSelected ? "white" : "gray";
    const iconSize = 24; // Adjust size if needed

    const getIcon = (name: string) => {
      switch (name) {
        case "home":
          return require("@/assets/images/homeIcon.png");
        case "invest":
          return require("@/assets/images/walletIcon.png");
        case "transactions":
          return require("@/assets/images/transactionsIcon.png");
        case "Apps":
          return require("@/assets/images/otherMenu.png");
        case "lifestyle":
          return require("@/assets/images/settingsIcon.png");
        default:
          return require("@/assets/images/homeIcon.png");
      }
    };

    return (
      <TouchableOpacity
        onPress={() => navigate(routeName)}
        style={[
          styles.tabItem,
          routeName === "transactions" ? { right: 20 } : {},
          routeName === "Apps" ? { left: 20 } : {},
        ]}
      >
        <Image
          source={getIcon(routeName)}
          style={{ height: iconSize, width: iconSize, tintColor: color }}
        />
        <Text style={{ color }}>
          {routeName.charAt(0).toUpperCase() + routeName.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <CurvedBottomBarExpo.Navigator
      style={styles.navigator}
      bgColor={"black"}
      type="UP"
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        header: CustomHeader,
      }}
      renderCircle={({ selectedTab, navigate }) => (
        <Animated.View style={{ bottom: 50, left: 10 }}>
          <Slider />
          {/* <TouchableOpacity>
            <Image source={require("@/assets/images/bpay_logo.png")} />
          </TouchableOpacity> */}
        </Animated.View>
      )}
      initialRouteName="home"
      tabBar={renderTabBar}
    >
      <CurvedBottomBarExpo.Screen
        name="home"
        component={HomeMainScreen}
        position="LEFT"
      />
      <CurvedBottomBarExpo.Screen
        name="transactions"
        component={TransactionScreen}
        position="LEFT"
      />
      <CurvedBottomBarExpo.Screen
        name="scan"
        component={Scan}
        position="CENTER"
      />
      <CurvedBottomBarExpo.Screen
        name="invest"
        component={InvestScreen}
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="wallet"
        component={Wallet}
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="stakeholder"
        component={Stakeholder}
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="crypto"
        component={Crypto}
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="Apps"
        component={Apps}
        position="RIGHT"
      />
      <CurvedBottomBarExpo.Screen
        name="lifestyle"
        component={LifestyleScreen}
        position="RIGHT"
      />
    </CurvedBottomBarExpo.Navigator>
  );
};

const styles = StyleSheet.create({
  navigator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});

export default Layout;

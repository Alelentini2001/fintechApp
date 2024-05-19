import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";
import CustomHeader from "@/components/CustomHeader";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import HomeMainScreen from "./home";
import InvestScreen from "./invest";
import TransactionScreen from "./transactions";
import Apps from "./apps";
import Settings from "./settings";
import Colors from "@/constants/Colors";
import Animated from "react-native-reanimated";
import ActionButton from "react-native-action-button";
import { NavigationContainerRef } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Scan from "./scan";
import Wallet from "./wallet";
import Stakeholder from "./stakeholder";
import Crypto from "./crypto";
import { useRouteInfo } from "expo-router/build/hooks";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import translations from "@/app/(authenticated)/(tabs)/translations.json";
import i18n from "./translate";
import Request from "./request";
import QrCode from "./qrCode";
import { useTheme } from "@/app/ThemeContext";
import PaymentConfirmationScreen from "./pay";
import TransactionListener from "./awaitTransaction";

const Slider = ({ colorScheme }) => {
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
        buttonColor={colorScheme === "light" ? Colors.background : Colors.dark}
        onPress={() => {
          console.log("Press");
          router.replace("/(authenticated)/(tabs)/scan");
        }}
        renderIcon={() => (
          <Image
            source={require("@/assets/images/bpay_logo.png")}
            style={{
              tintColor:
                colorScheme === "light" ? Colors.dark : Colors.background,
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
  let colorScheme = useTheme().theme;

  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    const isSelected = routeName === selectedTab;

    const color = isSelected
      ? colorScheme === "light"
        ? Colors.background
        : Colors.dark
      : Colors.gray;
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
        case "settings":
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
          {i18n.t(routeName.charAt(0).toUpperCase() + routeName?.slice(1))}
        </Text>
      </TouchableOpacity>
    );
  };

  const route = useRouteInfo();
  return (
    <CurvedBottomBarExpo.Navigator
      style={styles.navigator}
      bgColor={colorScheme === "light" ? Colors.dark : Colors.background}
      type="UP"
      screenOptions={{
        headerShown: ["/settings", "/scan", "/request", "/qrCode"].includes(
          route.pathname
        )
          ? false
          : true,

        headerTransparent: true,
        header: CustomHeader,
      }}
      renderCircle={({ selectedTab, navigate }) => (
        <Animated.View style={{ bottom: 50, left: 10 }}>
          <Slider colorScheme={colorScheme} />
        </Animated.View>
      )}
      initialRouteName="home"
      tabBar={renderTabBar}
    >
      <CurvedBottomBarExpo.Screen
        name="home"
        component={() => <HomeMainScreen t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="LEFT"
      />

      <CurvedBottomBarExpo.Screen
        name="transactions"
        component={() => <TransactionScreen t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="LEFT"
      />
      <CurvedBottomBarExpo.Screen
        name="scan"
        component={() => <Scan t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CENTER"
      />
      <CurvedBottomBarExpo.Screen
        name="pay"
        component={() => <PaymentConfirmationScreen t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CENTER"
      />
      {/* <CurvedBottomBarExpo.Screen
        name="awaitTransaction"
        component={() => <TransactionListener t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CENTER"
      /> */}

      {/* <CurvedBottomBarExpo.Screen
        name="invest"
        component={InvestScreen}
        position="CIRCLE"
      /> */}
      <CurvedBottomBarExpo.Screen
        name="wallet"
        component={() => <Wallet t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="stakeholder"
        component={() => <Stakeholder t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="request"
        component={() => <Request t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="qrCode"
        component={() => <QrCode t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="crypto"
        component={Crypto}
        position="CIRCLE"
      />
      <CurvedBottomBarExpo.Screen
        name="Apps"
        component={() => <Apps t={i18n.t.bind(i18n)} />} // Ensuring `t` is bound to `i18n`
        position="RIGHT"
      />
      <CurvedBottomBarExpo.Screen
        name="settings"
        component={Settings}
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

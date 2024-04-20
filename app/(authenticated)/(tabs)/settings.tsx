import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Colors from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { setAppIcon } from "expo-dynamic-app-icon";
import * as Localization from "expo-localization";
import i18n from "./translate";

const Settings = () => {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useAuth();

  const [currentLocale, setCurrentLocale] = useState(
    Localization.getLocales()[0].languageCode || "en"
  );

  // Update i18n.locale whenever the locale state changes
  useEffect(() => {
    i18n.locale = currentLocale;
    console.log(currentLocale);
  }, [currentLocale]);

  // State to manage the switch position
  const [isNotificationsEnabled, setIsNotificationsEnabled] =
    useState<boolean>(false);

  // Handler to toggle the switch state
  const toggleSwitch = () =>
    setIsNotificationsEnabled((previousState) => !previousState);

  const [showIcons, setShowIcons] = useState<boolean>(false);
  const [showLanguages, setShowLanguages] = useState<boolean>(false);

  const [activeIcon, setActiveIcon] = useState("Default");

  const ICONS = [
    {
      name: "Default",
      icon: require("@/assets/images/icon.png"),
    },
    {
      name: "Dark",
      icon: require("@/assets/images/icon-dark.png"),
    },
    {
      name: "Vivid",
      icon: require("@/assets/images/icon-vivid.png"),
    },
  ];

  const onChangeAppIcon = async (icon: string) => {
    await setAppIcon(icon.toLowerCase());
    setActiveIcon(icon);
  };
  return (
    <ScrollView style={{ marginTop: 80 }}>
      <View style={{ flexDirection: "column" }}>
        <Text
          style={{
            marginTop: 30,
            marginLeft: 20,
            color: Colors.dark,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          {i18n.t("Profile")}
        </Text>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <View
            style={{
              height: 85,
              width: "90%",
              backgroundColor: "white",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              borderColor: Colors.lightGray,
              borderWidth: 0.5,
            }}
          >
            <Image
              source={{ uri: user?.imageUrl }}
              style={{
                width: 60,
                height: 60,
                marginLeft: 10,
                marginRight: 5,
                borderRadius: 50,
                backgroundColor: Colors.gray,
              }}
            />
            <View
              style={{
                flexDirection: "column",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: Colors.dark, fontSize: 16, fontWeight: "500" }}
              >
                {user?.fullName}
              </Text>
              <Text
                style={{ color: Colors.gray, fontSize: 12, fontWeight: "400" }}
              >
                {user?.primaryEmailAddress?.toString()}
              </Text>
              <Text
                style={{ color: Colors.gray, fontSize: 12, fontWeight: "400" }}
              >
                {user?.primaryPhoneNumber?.toString()}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.dark,
                borderRadius: 50,
                width: 85,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Link href={"/(authenticated)/(modals)/account"} asChild>
                <Text style={{ color: "white", fontSize: 10 }}>
                  {i18n.t("Edit Profile")}
                </Text>
              </Link>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            marginTop: 30,
            marginLeft: 20,
            color: Colors.dark,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          {i18n.t("Settings")}
        </Text>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <View
            style={{
              height: "auto",
              padding: 10,
              width: "90%",
              backgroundColor: "white",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              borderColor: Colors.lightGray,
              borderWidth: 0.5,
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: "rgba(255,251,233,1)",
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: Colors.lightGray,
                    borderWidth: 0.5,
                  }}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={28}
                    color={"rgba(255,221,87,1)"}
                  />
                </View>
                <Text
                  style={{ marginLeft: 20, fontSize: 16, fontWeight: "400" }}
                >
                  {i18n.t("Notifications")}
                </Text>
                <View style={{ flex: 1 }} />
                <Switch
                  style={{ marginRight: 10 }}
                  value={isNotificationsEnabled}
                  onValueChange={toggleSwitch}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
              onPress={() => {
                setShowLanguages(!showLanguages);
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: "rgba(243, 238, 249, 1)",
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: Colors.lightGray,
                    borderWidth: 0.5,
                  }}
                >
                  <Ionicons
                    name="language-outline"
                    size={28}
                    color={"rgba(162,90,255,1)"}
                  />
                </View>
                <Text
                  style={{ marginLeft: 20, fontSize: 16, fontWeight: "400" }}
                >
                  {i18n.t("Languages")}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    setShowLanguages(!showLanguages);
                  }}
                >
                  <Ionicons name="arrow-forward-outline" size={22} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {showLanguages && (
              <View
                style={{
                  width: "80%",
                  backgroundColor: "white",
                  borderColor: Colors.lightGray,
                  borderWidth: 0.5,
                  borderRadius: 10,
                  height: "auto",
                }}
              >
                {[{ English: "en" }, { Italiano: "it" }, { Español: "es" }].map(
                  (language) => (
                    <TouchableOpacity
                      key={Object.values(language)[0]}
                      style={{ padding: 14, flexDirection: "row", gap: 20 }}
                      onPress={() => {
                        i18n.locale = Object.values(language)[0];
                        setShowLanguages(!showLanguages);
                      }}
                    >
                      <Text style={{ color: Colors.dark, fontSize: 18 }}>
                        {Object.keys(language)[0]}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
            <TouchableOpacity
              onPress={() => {
                setShowIcons(!showIcons);
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: Colors.dark,
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: Colors.lightGray,
                    borderWidth: 0.5,
                  }}
                >
                  <Image
                    source={require("@/assets/images/bpay_logo.png")}
                    style={{ height: 30, width: 30, tintColor: "white" }}
                  />
                </View>
                <Text
                  style={{ marginLeft: 20, fontSize: 16, fontWeight: "400" }}
                >
                  {i18n.t("App Icon")}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    setShowIcons(!showIcons);
                  }}
                >
                  <Ionicons
                    name={
                      showIcons ? "arrow-down-outline" : "arrow-forward-outline"
                    }
                    size={22}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {showIcons && (
              <View
                style={{
                  width: "80%",
                  backgroundColor: "white",
                  borderColor: Colors.lightGray,
                  borderWidth: 0.5,
                  borderRadius: 10,
                  height: "auto",
                }}
              >
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={{ padding: 14, flexDirection: "row", gap: 20 }}
                    onPress={() => onChangeAppIcon(icon.name)}
                  >
                    <Image
                      source={icon.icon}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text style={{ color: Colors.dark, fontSize: 18 }}>
                      {i18n.t(icon.name)}
                    </Text>
                    {activeIcon.toLowerCase() === icon.name.toLowerCase() && (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={Colors.dark}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: "rgba(254, 242, 229, 1)",
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: Colors.lightGray,
                    borderWidth: 0.5,
                  }}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={28}
                    color={"rgba(240,154,65,1)"}
                  />
                </View>
                <Text
                  style={{ marginLeft: 20, fontSize: 16, fontWeight: "400" }}
                >
                  {i18n.t("Security and Password")}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={{ marginRight: 10 }}>
                  <Ionicons name="arrow-forward-outline" size={22} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
              onPress={() => {
                signOut();
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 60,
                    width: 60,
                    backgroundColor: "rgba(254, 231, 228, 1)",
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: Colors.lightGray,
                    borderWidth: 0.5,
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={28}
                    color={"rgba(240,154,65,1)"}
                  />
                </View>
                <Text
                  style={{ marginLeft: 20, fontSize: 16, fontWeight: "400" }}
                >
                  {i18n.t("Logout")}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    signOut();
                  }}
                >
                  <Ionicons name="arrow-forward-outline" size={22} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default Settings;

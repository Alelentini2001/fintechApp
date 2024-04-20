import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as LocalAuthentication from "expo-local-authentication";
import Colors from "@/constants/Colors";
import { MMKV } from "react-native-mmkv";
import { useUser } from "@clerk/clerk-expo";

// Initialize MMKV
const storage = new MMKV();

const Lock = () => {
  const [code, setCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const offset = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
  const OFFSET = 20;
  const TIME = 80;

  let storedPasscode = storage.getString("passcode");

  const checkPasscode = () => {
    const storedPasscode = storage.getString("passcode");
    if (storedPasscode) {
      if (code === storedPasscode) {
        router.replace("/(authenticated)/(tabs)/home");
      } else {
        triggerError();
      }
    } else if (!isConfirming) {
      setConfirmCode(code);
      setIsConfirming(true);
      setCode("");
    } else if (isConfirming) {
      if (code === confirmCode) {
        storage.set("passcode", code);
        router.replace("/(authenticated)/(tabs)/home");
      } else {
        setError(true);
        setIsConfirming(false);
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 2 }),
          withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
          withTiming(0, { duration: TIME / 2 })
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        setCode("");
        setConfirmCode("");
      }
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      checkPasscode();
    }
  }, [code]);

  const triggerError = () => {
    offset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 4, true),
      withTiming(0, { duration: 50 })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setCode(""); // Reset code
  };

  const onNumberPress = (number) => {
    if (code.length < 6) {
      setCode((prev) => prev + number);
    }
  };

  const numberBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode(code.slice(0, -1));
  };

  const onBiometricAuthPress = async () => {
    if (storedPasscode) {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        router.replace("/(authenticated)/(tabs)/home");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      triggerError();
    }
  };

  const onBiometricAuthPressForgot = async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    if (success) {
      storage.set("passcode", "");
      storedPasscode = "";
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView>
      <Text style={styles.greeting}>
        {storedPasscode
          ? `Welcome back, ${user?.firstName}`
          : !isConfirming
          ? "Set your new Passcode"
          : "Reinsert your passcode"}
      </Text>
      <Animated.View style={[styles.codeView, style]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeEmpty,
              {
                backgroundColor:
                  index < code.length ? Colors.primary : Colors.lightGray,
              },
            ]}
          />
        ))}
      </Animated.View>
      <View style={[styles.numbersView]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[1, 2, 3].map((number) => (
            <TouchableOpacity
              key={number}
              onPress={() => {
                onNumberPress(number);
              }}
            >
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {[4, 5, 6].map((number) => (
            <TouchableOpacity
              key={number}
              onPress={() => {
                onNumberPress(number);
              }}
            >
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[7, 8, 9].map((number) => (
            <TouchableOpacity
              key={number}
              onPress={() => {
                onNumberPress(number);
              }}
            >
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity key={10} onPress={onBiometricAuthPress}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={26}
              color={"black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            key={0}
            onPress={() => {
              onNumberPress(0);
            }}
          >
            <Text style={styles.number}>0</Text>
          </TouchableOpacity>
          <View style={{ minWidth: 30 }}>
            {code.length > 0 && (
              <TouchableOpacity key={11} onPress={numberBackspace}>
                <MaterialCommunityIcons
                  name="backspace-outline"
                  size={26}
                  color={"black"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            onBiometricAuthPressForgot();
          }}
        >
          <Text
            style={{
              alignSelf: "center",
              color: Colors.primary,
              fontWeight: "500",
              fontSize: 18,
            }}
          >
            Forgot your passcode?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 80,
    alignSelf: "center",
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 100,
    alignItems: "center",
  },
  codeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  numbersView: {
    marginHorizontal: 80,
    gap: 60,
  },
  number: { fontSize: 32 },
});

export default Lock;

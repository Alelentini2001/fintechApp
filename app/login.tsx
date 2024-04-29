import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import translations from "@/app/(authenticated)/(tabs)/translations.json";

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0].languageCode || "en";
i18n.enableFallback = true;

enum SignInType {
  Phone,
  Email,
  Google,
  Apple,
}

const Login = () => {
  const [countryCode, setCountryCode] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emailSignIn, setEmailSignIn] = useState(false);
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const router = useRouter();
  const { signIn } = useSignIn();
  let colorScheme = useTheme().theme;

  const onSignIn = async (type: SignInType) => {
    if (type === SignInType.Phone) {
      try {
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        const { supportedFirstFactors } = await signIn!.create({
          identifier: fullPhoneNumber,
        });

        const firstPhoneFactor: any = supportedFirstFactors.find(
          (factor: any) => {
            return factor.strategy == "phone_code";
          }
        );

        const { phoneNumberId } = firstPhoneFactor;

        await signIn!.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId,
        });

        router.push({
          pathname: "/verify/[phone]",
          params: { phone: fullPhoneNumber, signin: "true", email: "" },
        });
      } catch (err) {
        console.log("error", JSON.stringify(err, null, 2));
        if (isClerkAPIResponseError(err)) {
          if (err.errors[0].code === "form_identifier_not_found") {
            Alert.alert("Error", err.errors[0].message);
          }
        }
      }
    } else if (type === SignInType.Email) {
      try {
        const signed = await signIn;

        const { supportedFirstFactors } = await signIn.create({
          identifier: email,
        });
        const firstEmailFactor = supportedFirstFactors.find(
          (factor) => factor.strategy === "email_code"
        );

        // Ensure that we have a valid email factor object
        if (!firstEmailFactor || !firstEmailFactor.emailAddressId) {
          console.error(
            "Email code sign-in strategy not found or missing email address ID."
          );
          return; // Exit function or handle error appropriately
        }

        const { emailAddressId } = firstEmailFactor;

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailAddressId, // Corrected the property name
        });

        // Using router to navigate to the verification page
        // Make sure to use `query` instead of `params` if you're using next/router or a similar routing system

        router.push({
          pathname: "/verify/[phone]",
          params: { email: email, signin: "true" },
        });
      } catch (err) {
        console.log("error", JSON.stringify(err, null, 2));
        if (isClerkAPIResponseError(err)) {
          if (err.errors[0].code === "form_identifier_not_found") {
            Alert.alert("Error", err.errors[0].message);
          }
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
      }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View
        style={[
          defaultStyles.container,
          {
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
          },
        ]}
      >
        <Text
          style={[
            defaultStyles.header,
            {
              color: colorScheme === "dark" ? Colors.background : Colors.dark,
            },
          ]}
        >
          {i18n.t("Welcome back!")}
        </Text>
        <Text style={defaultStyles.descriptionText}>
          {i18n.t(
            `Enter the ${
              emailSignIn ? "email" : "phone number"
            } associated with your account`
          )}
        </Text>
        {!emailSignIn ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Country code"
              placeholderTextColor={Colors.gray}
              value={countryCode}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={i18n.t("Mobile number")}
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Email"
              autoCapitalize="none"
              placeholderTextColor={Colors.gray}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        )}
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            phoneNumber !== "" || email !== ""
              ? styles.enabled
              : styles.disabled,
            { marginBottom: "5%" },
          ]}
          onPress={() => {
            onSignIn(emailSignIn ? SignInType.Email : SignInType.Phone);
          }}
        >
          <Text style={defaultStyles.buttonText}>{i18n.t("Continue")}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.gray,
            }}
          />
          <Text style={{ color: Colors.gray, fontSize: 20 }}>
            {i18n.t("or")}
          </Text>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.gray,
            }}
          />
        </View>
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            {
              flexDirection: "row",
              gap: 16,
              marginTop: "5%",
              backgroundColor: "#fff",
            },
          ]}
          onPress={() => {
            //onSignIn(SignInType.Email);
            setEmailSignIn(!emailSignIn);
          }}
        >
          <Ionicons
            name={emailSignIn ? "call" : "mail"}
            size={24}
            color={"#000"}
          />
          <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
            {i18n.t(`Continue with ${emailSignIn ? "phone number" : "email"}`)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            {
              flexDirection: "row",
              gap: 16,
              marginTop: "5%",
              backgroundColor: "#fff",
            },
          ]}
          onPress={() => {
            onSignIn(SignInType.Google);
          }}
        >
          <Ionicons name="logo-google" size={24} color={"#000"} />
          <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
            {i18n.t("Continue with Google")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            {
              flexDirection: "row",
              gap: 16,
              marginTop: 20,
              backgroundColor: "#fff",
            },
          ]}
          onPress={() => {
            onSignIn(SignInType.Apple);
          }}
        >
          <Ionicons name="logo-apple" size={24} color={"#000"} />
          <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
            {i18n.t("Continue with Apple")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: "10%",
    flexDirection: "row",
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: "5%",
    borderRadius: 16,
    fontSize: 20,
    marginRight: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },
});
export default Login;

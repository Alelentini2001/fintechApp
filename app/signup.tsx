import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Signup = () => {
  const [countryCode, setCountryCode] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emailSignUp, setEmailSignUp] = useState(false);
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const router = useRouter();
  const { signUp } = useSignUp();

  const onSignup = async () => {
    if (!emailSignUp) {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      try {
        await signUp!.create({
          phoneNumber: fullPhoneNumber,
        });
        signUp!.preparePhoneNumberVerification();
        router.push({
          pathname: "/verify/[phone]",
          params: { phone: fullPhoneNumber },
        });
      } catch (err) {
        console.error("Error signing up:", err);
      }
    } else {
      try {
        await signUp!.create({
          emailAddress: email,
        });
        signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
        router.push({
          pathname: "/verify/[phone]",
          params: { email: email },
        });
      } catch (err) {
        console.error("Error signing up:", err);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Let's Get Started!</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter your {emailSignUp ? "email" : "phone number"}. We will send you
          a confirmation code there
        </Text>
        {!emailSignUp ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Country code"
              placeholderTextColor={Colors.gray}
              value={countryCode}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mobile number"
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
              placeholderTextColor={Colors.gray}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.gray,
            }}
          />
          <Text style={{ color: Colors.gray, fontSize: 20 }}>or</Text>
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
              marginTop: 20,
              backgroundColor: "#fff",
            },
          ]}
          onPress={() => {
            //onSignIn(SignInType.Email);
            setEmailSignUp(!emailSignUp);
          }}
        >
          <Ionicons
            name={emailSignUp ? "call" : "mail"}
            size={24}
            color={"#000"}
          />
          <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
            Continue with {emailSignUp ? "phone number" : "email"}
          </Text>
        </TouchableOpacity>
        <Link href={"/login"} replace asChild style={{ marginTop: 20 }}>
          <TouchableOpacity>
            <Text style={defaultStyles.textLink}>
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </Link>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            phoneNumber !== "" || email !== ""
              ? styles.enabled
              : styles.disabled,
            { marginBottom: 20 },
          ]}
          onPress={onSignup}
        >
          <Text style={defaultStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 40,
    flexDirection: "row",
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 20,
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
export default Signup;

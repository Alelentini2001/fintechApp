import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import axios from "axios";
import QRCodeStyled from "react-native-qrcode-styled";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/app/ThemeContext";

const QrCode = ({ t }) => {
  let colorScheme = useTheme().theme;

  const { amount, reference } = useLocalSearchParams<{
    amount: string;
    reference: string;
  }>();
  const router = useRouter();
  const [smallQRCode, setSmallQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { user } = useUser();

  const generateQRCode = () => {
    setIsLoading(true);
    const amountt = parseFloat(amount).toFixed(2);
    const qrCodeData = {
      amount: amountt,
      reference,
      merchantUsername: user?.username,
      merchantId: user?.id,
      merchantFullName: user?.fullName,
      merchantEmail: user?.primaryEmailAddress?.emailAddress.toString(),
      merchantPhone: user?.primaryPhoneNumber?.phoneNumber,
    };

    const qrCodeParams = new URLSearchParams(qrCodeData).toString();
    const qrCodeURL = `${qrCodeParams}`;

    // Typically, you'd use a backend service or a URL shortener API here
    setQrCodeUrl(qrCodeURL);
    setIsLoading(false);
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <View
      style={{
        paddingTop: 50,
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor:
          colorScheme === "light" ? Colors.background : Colors.dark,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          alignContent: "center",
          marginTop: 50,
        }}
      >
        <TouchableOpacity
          style={{ flex: 0.8, marginLeft: 20 }}
          onPress={() => {
            router.push({
              pathname: "/(authenticated)/(tabs)/request",
              params: { previousAmount: amount, prevReference: reference },
            });
          }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={colorScheme === "dark" ? Colors.background : Colors.dark}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "400",
            color: colorScheme === "dark" ? Colors.background : Colors.dark,
          }}
        >
          {t("Payment Request")}
        </Text>
        <View style={{ flex: 1 }} />
      </View>
      <View
        style={{
          width: "100%",
          height: "100%",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <View
          //   source={require("@/assets/images/cardQrCode.png")}
          style={[
            styles.backgroundImage,
            {
              backgroundColor:
                colorScheme === "light" ? Colors.background : Colors.dark,
              borderColor:
                colorScheme === "light" ? Colors.dark : Colors.background,
              borderWidth: 0.5,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            {!isLoading && (
              <QRCodeStyled
                data={qrCodeUrl}
                // width={smallQRCode ? "auto" : 50} // Adjust the width to make the QR code smaller
                // height={smallQRCode ? "auto" : 50} // Adjust the height to make the QR code smaller
                style={[
                  styles.svg,
                  {
                    marginTop: 20,
                    width: 20,
                    height: 20,
                    backgroundColor:
                      colorScheme === "light" ? Colors.background : Colors.dark,
                  },
                ]}
                logo={{
                  href: require("@/assets/images/bpay_logo.png"),
                }}
                padding={smallQRCode ? 20 : 10} // You can reduce the padding to make the QR code smaller
                color={colorScheme === "dark" ? Colors.background : Colors.dark}
                pieceSize={smallQRCode ? 7 : 5} // You can reduce the pieceSize to make the QR code smaller
                pieceBorderRadius={smallQRCode ? 4 : 2} // You can reduce the pieceBorderRadius to make the QR code smaller
                isPiecesGlued
                innerEyesOptions={{
                  borderRadius: smallQRCode ? 8 : 4, // You can reduce the borderRadius to make the inner eyes smaller
                  color:
                    colorScheme === "dark" ? Colors.background : Colors.dark,
                }}
                outerEyesOptions={{
                  borderRadius: smallQRCode ? 20 : 10, // You can reduce the borderRadius to make the outer eyes smaller
                  color:
                    colorScheme === "dark" ? Colors.background : Colors.dark,
                }}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                marginTop: 20,
                color: colorScheme === "dark" ? Colors.background : Colors.dark,
              }}
            >
              {t("Amount")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              //   alignContent: "center",
              alignItems: "center",
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <View
              style={{
                height: 2,
                width: 50,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: Colors.gray,
                marginRight: 20,
              }}
            />
            <View style={{ alignItems: "baseline", flexDirection: "row" }}>
              <Text
                style={{ color: Colors.gray, fontSize: 35, fontWeight: "bold" }}
              >
                €
              </Text>
              <Text
                style={{
                  color:
                    colorScheme === "dark" ? Colors.background : Colors.dark,
                  fontSize: 35,
                  fontWeight: "bold",
                }}
              >
                {parseFloat(amount).toFixed(2).slice(0, -3)}
                <Text style={{ fontSize: 20, color: "gray" }}>
                  {parseFloat(amount).toFixed(2).slice(-3)}
                </Text>
              </Text>
            </View>
            <View
              style={{
                height: 2,
                width: 50,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: Colors.gray,
                marginLeft: 20,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              marginTop: 30,
              justifyContent: "flex-start",
              marginLeft: 20,
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "400", color: Colors.gray }}
            >
              {t("Account Name")}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colorScheme === "dark" ? Colors.background : Colors.dark,
                marginTop: 10,
              }}
            >
              {user?.fullName}
            </Text>
          </View>
          <View
            style={{ flexDirection: "column", marginTop: 30, marginLeft: 20 }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "400", color: Colors.gray }}
            >
              {t("Reference")}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colorScheme === "dark" ? Colors.background : Colors.dark,
                marginTop: 10,
              }}
            >
              {reference}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <Text
              style={{
                marginBottom: 5,
                color: Colors.gray,
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              #1131dasf123fdasy2g34h
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
            justifyContent: "center",
            alignContent: "center",
            width: "100%",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor:
                colorScheme === "dark" ? Colors.background : Colors.dark,
              borderRadius: 15,
              width: "80%",
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
            }}
            onPress={() => {
              router.replace("/(authenticated)/(tabs)/home");
            }}
          >
            <Image
              source={require("@/assets/images/bpay_logo.png")}
              style={{
                height: 20,
                width: 20,
                tintColor:
                  colorScheme === "light" ? Colors.background : Colors.dark,
              }}
            />
            <Text
              style={{
                color:
                  colorScheme === "light" ? Colors.background : Colors.dark,
                fontSize: 14,
                fontWeight: "400",
              }}
            >
              {t("Check Payments")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: "80%",
    height: "65%", // Full height of the screen
    // justifyContent: "center", // Center the children vertically
    //alignItems: "center", // Center the children horizontally
    objectFit: "scale-down",
    marginTop: 40,
    borderRadius: 15,
  },
  text: {
    fontSize: 24, // Larger text to be easily readable
  },
  svg: {
    borderRadius: 40,
    overflow: "hidden",
  },
});

export default QrCode;

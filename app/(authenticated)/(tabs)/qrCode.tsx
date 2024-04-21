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

const QrCode = ({ t }) => {
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
    // Prepare data for QR code
    let qrCodeData = {
      amount,
      reference,
    };
    console.log(qrCodeData);
    // Convert data to URL parameters
    let qrCodeParams = new URLSearchParams(qrCodeData).toString();

    // Create complete URL
    let qrCodeURL = `https://app.b-pay.it?${qrCodeParams}`;

    // Create shortened URL using Bitly
    const bitlyAccessToken = "beb1018dda01fdc2740b15ffbbff331acc523d27"; // Replace with your Bitly access token
    axios
      .post(
        "https://api-ssl.bitly.com/v4/shorten",
        {
          long_url: qrCodeURL,
          domain: "bit.ly",
        },
        {
          headers: {
            Authorization: `Bearer ${bitlyAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // Set the QR code URL to the shortened URL
        setQrCodeUrl(response.data.link);
        setIsLoading(false);
        setSmallQRCode(true);
        console.log(isLoading);
      })
      .catch((error) => {
        console.error("Error shortening URL:", error);
        // Fallback: use the original URL if unable to shorten
        setQrCodeUrl(qrCodeURL);
        setSmallQRCode(false);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <View
      style={{
        marginTop: 50,
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
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
          <Ionicons name="arrow-back-outline" size={22} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "400" }}>
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
          style={styles.backgroundImage}
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
                  },
                ]}
                logo={{
                  href: smallQRCode && require("@/assets/images/bpay_logo.png"),
                }}
                padding={smallQRCode ? 20 : 10} // You can reduce the padding to make the QR code smaller
                color={"#000"}
                pieceSize={smallQRCode ? 7 : 5} // You can reduce the pieceSize to make the QR code smaller
                pieceBorderRadius={smallQRCode ? 4 : 2} // You can reduce the pieceBorderRadius to make the QR code smaller
                isPiecesGlued
                innerEyesOptions={{
                  borderRadius: smallQRCode ? 8 : 4, // You can reduce the borderRadius to make the inner eyes smaller
                  color: "#000",
                }}
                outerEyesOptions={{
                  borderRadius: smallQRCode ? 20 : 10, // You can reduce the borderRadius to make the outer eyes smaller
                  color: "#000",
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
            <Text style={{ marginTop: 20 }}>{t("Amount")}</Text>
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
                style={{ color: Colors.dark, fontSize: 35, fontWeight: "bold" }}
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
                color: Colors.dark,
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
                color: Colors.dark,
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
              backgroundColor: "black",
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
              style={{ height: 20, width: 20, tintColor: "white" }}
            />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "400" }}>
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
    backgroundColor: "white",
  },
  text: {
    color: "white", // White text color for better visibility on dark backgrounds
    fontSize: 24, // Larger text to be easily readable
  },
  svg: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 40,
    overflow: "hidden",
  },
});

export default QrCode;

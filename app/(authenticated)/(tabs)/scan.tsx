import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TextInput,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import i18n from "./translate";

const Scan = ({ t }) => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  return (
    <View style={styles.container}>
      <Camera
        type={type}
        style={{ height: "80%", width: "100%", marginTop: -20 }}
        onBarCodeScanned={(event) => {
          const qrCodeData = event.data;
          //   if (qrCodeData && Linking.canOpenURL(qrCodeData)) {
          //     setAuthUrl(qrCodeData);
          //     setShowScanner(false);
          //   }
          console.log(qrCodeData);
        }}
        // Other camera configurations as needed
      />
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          width: "100%",
          height: "40%",
          marginTop: "auto",
          borderRadius: 50,
          bottom: 0,
        }}
      >
        <Image
          source={require("@/assets/images/scanScan.png")}
          style={{ width: 54, height: 54, marginTop: 50 }}
        />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            marginTop: 25,
          }}
        >
          {i18n.t("Payment with QR Code")}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              color: "gray",
              fontWeight: "400",
              marginTop: 25,
              textAlign: "center", // Horizontally center the text
              justifyContent: "center", // Vertically center the text
              flex: 1, // Ensure the text takes up the available space for vertical centering
            }}
          >
            {i18n.t(
              "Hold the code inside the frame, it will be scanned automatically"
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    margin: 0, // Set margin to 0 to remove any outer spacing
  },
  institutionBox: {
    marginBottom: 20,
    alignItems: "center",
  },
  institutionImage: {
    width: 100,
    height: 100,
  },
  institutionName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  scanQrCode: {
    marginTop: 20,
    fontSize: 16,
    alignItems: "center",
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  institutionsContainer: {
    marginBottom: 20,
  },
  institutionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject, // Fill the entire screen
  },
  webview: {
    flex: 1,
    width: "100%",
  },
  camera: {
    ...StyleSheet.absoluteFillObject, // Fill the entire screen
  },
  generateButton: {
    backgroundColor: "black",
    borderRadius: 30,
    height: 70,
    width: "80%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Scan;

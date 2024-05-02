import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";
import { useTheme } from "./ThemeContext";

const Terms = () => {
  let colorScheme = useTheme().theme;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === "light" ? Colors.background : Colors.dark,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colorScheme === "light" ? Colors.dark : Colors.background },
        ]}
      >
        <Text style={styles.title}>Terms and Conditions</Text>
        {"\n\n"}
        Welcome to Our Application. By accessing or using our service, you agree
        to be bound by these terms. If you disagree with any part of the terms,
        then you may not access the service. {"\n\n"}
        1. Intellectual Property {"\n"}
        The content, arrangement and layout of this site, including, but not
        limited to, the trademarks, photos, logos, text, and other intellectual
        property contained herein, are the property of [Your Company Name],
        except as otherwise noted. {"\n\n"}
        2. Use License {"\n"}
        Permission is granted to temporarily download one copy of the materials
        (information or software) on Our Application's website for personal,
        non-commercial transitory viewing only. {"\n\n"}
        3. If you download or print a copy of the materials (information or
        software), you must keep intact all copyright and other proprietary
        notices. {"\n\n"}
        4. You may not modify, copy, distribute, transmit, display, perform,
        reproduce, publish, license, create derivative works from, or in any way
        exploit in any way any of the material on Our Application's website or
        the information or software contained therein, except as permitted by
        applicable law. {"\n\n"}
        5. The materials on Our Application's website are provided on an 'as is'
        basis. Our Application makes no warranties, expressed or implied, and
        hereby disclaims and negates all other warranties, including without
        limitation, implied warranties or conditions of merchantability, fitness
        for a particular purpose, or non-infringement of intellectual property
        or other violation of rights. {"\n\n"}
        Further, Our Application does not warrant or make any representations
        regarding the accuracy, reliability, or currency of the information or
        software contained on Our Application's website, or otherwise relating
        to such information or software. {"\n\n"}
        6. Our Application may contain links to third-party websites or services
        that are not owned or controlled by Our Application. Our Application has
        no control over, and assumes no responsibility for, the content, privacy
        policies, or practices of any third-party websites or services. You
        further acknowledge and agree that Our Application shall not be
        responsible or liable, directly or indirectly, for any damage or loss
        caused or alleged to be caused by or in connection with use of or
        reliance on any such content, goods or services available on or through
        any such websites or services.
        {"\n\n"}
        {/* More terms can be added similarly */}
      </Text>
      {/* <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              colorScheme === "light" ? Colors.background : Colors.dark,
            borderColor:
              colorScheme === "light" ? Colors.dark : Colors.background,
          },
        ]}
        onPress={() => console.log("Accepted Terms")} // Replace with actual navigation or action
      >
        <Text
          style={{
            color: colorScheme === "light" ? Colors.dark : Colors.background,
          }}
        >
          Accept and Close
        </Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
});

export default Terms;

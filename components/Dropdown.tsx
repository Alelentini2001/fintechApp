import { View, Text, StyleSheet } from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";
import RoundBtn from "./RoundBtn";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const Dropdown = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {/* <RoundBtn icon={"filter-outline"} text={"More"} /> */}
        <View style={styles.circle}>
          <Ionicons name="filter-outline" size={24} color={"white"} />
        </View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item key="statement">
          <DropdownMenu.ItemTitle>Statement</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{ name: "list.bullet.rectangle.fill", pointSize: 24 }}
          />
        </DropdownMenu.Item>
        <DropdownMenu.Item key="converter">
          <DropdownMenu.ItemTitle>Converter</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{ name: "coloncurrencysign.arrow.circlepath", pointSize: 24 }}
          />
        </DropdownMenu.Item>
        <DropdownMenu.Item key="background">
          <DropdownMenu.ItemTitle>Background</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "photo.fill", pointSize: 24 }} />
        </DropdownMenu.Item>
        <DropdownMenu.Item key="account">
          <DropdownMenu.ItemTitle>Account</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{ name: "plus.rectangle.on.folder.fill", pointSize: 24 }}
          />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 70,
    marginRight: 10,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Dropdown;

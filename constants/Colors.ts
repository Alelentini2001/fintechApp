import { useColorScheme } from "react-native";

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
let colorScheme = useColorScheme();

export default {
  primary: "#3D38ED",
  primaryMuted: "#C9C8FA",
  background: colorScheme === "light" ? "#F5F5F5" : "#141518",
  dark: colorScheme === "light" ? "#141518" : "#F5F5F5",
  gray: "#626D77",
  lightGray: "#D8DCE2"
};

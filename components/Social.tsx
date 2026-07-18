import { TouchableOpacity, StyleSheet, View, Linking } from "react-native";
import Octicons from "@expo/vector-icons/Octicons";
type ZocialName = React.ComponentProps<typeof Octicons>["name"];


interface Props {
  href: string;
  icon: ZocialName;
}

export default function Social({ href, icon }: Props) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <View style={style.icon}>
        <Octicons name={icon} size={16} color="#2a2a2a" />
      </View>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  icon: {
    width: 28,
    height: 28,
    backgroundColor: "#dddddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius:8,
    padding: 4,
  },
});

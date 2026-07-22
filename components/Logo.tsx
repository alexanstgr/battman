import { CSSProperties } from "react";
import { Image, StyleSheet } from "react-native";

export default function Logo() {
  const style = StyleSheet.create({
    logo: {
      width: 200,
      height: 50,
      marginLeft:10,
      resizeMode: "contain",
    },
  });

  return <Image style={style.logo} source={require("../assets/battman.png")} />;
}

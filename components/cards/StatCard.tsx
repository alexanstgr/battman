import { View, Text, StyleSheet } from "react-native";
import themeColors from "@/constants/colors";

import { Ionicons } from "@react-native-vector-icons/ionicons";
import colors from "@/constants/colors";

export default function StatCard({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  colors: typeof themeColors;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>

      <View style={styles.iconbox}>
        <View>
          <Ionicons name={icon} color={colors.primary} size={22} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconbox: {
    width: 32,
    height: 32,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:'rgb(236, 236, 236)',
    borderRadius: colors.radius,
    top: "20%",
    bottom: "80%",
    right: 20,
  },

  statBox: {
    width: "48%",
    borderRadius: 18,
    padding: 16,
    borderColor: themeColors.cardBorderColor,
    borderWidth:themeColors.cardBorderWidth,
    backgroundColor: themeColors.card,
    gap: 4,
  },

  statNum: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});

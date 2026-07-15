import { Feather } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SwipeableRow } from "../SwipeableRow";
import { router } from "expo-router";
import { Device, Battery } from "@/types";
import themeColors from "@/constants/colors";
import { getCategoryLabel } from "../CategoryIcon";
import { CategoryIcon } from "../CategoryIcon";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

import BatteryLevel from "../BatteryLevel";

const cardShadow = {
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.012,
  shadowRadius: 5,
  elevation: 2,
};

export default function DeviceCard({
  device,
  batteries,
  onDelete,
  onEdit,
  colors,
}: {
  device: Device;
  batteries: Battery[];
  onDelete: () => void;
  onEdit: () => void;
  colors: typeof themeColors;
}) {
  const charged = batteries.filter((b) => b.status === "charged").length;
  const total = batteries.length;
  const readyPct = total > 0 ? Math.round((charged / total) * 100) : null;
  const catLabel = getCategoryLabel(device.category);
  const t = useTranslation();

  return (
    <SwipeableRow onDelete={onDelete} onEdit={onEdit}>
      <Pressable
        style={({ pressed }) => [
          styles.deviceRow,
          { backgroundColor: colors.card, shadowColor: colors.shadow },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => router.push(`/device/${device.id}`)}
      >
        <View style={styles.deviceRowLeft}>
          <View style={[styles.catIconWrap, { backgroundColor: colors.muted }]}>
            <CategoryIcon
              category={device.category}
              size={16}
              showBackground={false}
            />
          </View>
          <View style={styles.deviceInfo}>
            <Text
              style={[styles.deviceName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {device.name}
            </Text>
            <Text
              style={[styles.deviceMeta, { color: colors.mutedForeground }]}
            >
              {catLabel} · {t.batteriesCount(total)}
            </Text>
          </View>
        </View>
        <View style={styles.deviceRowRight}>
          {total > 0 ? (
            <>
              <View style={styles.miniCells}>
                {batteries.slice(0, 6).map((b) => (
                  <View id={b.id} key={b.id}>
                    <BatteryLevel status={b.status} />
                  </View>
                ))}
              </View>
              {readyPct !== null && (
                <Text
                  style={[
                    styles.rowPct,
                    {
                      color:
                        readyPct === 100
                          ? colors.charged
                          : readyPct > 50
                            ? colors.foreground
                            : colors.discharged,
                    },
                  ]}
                >
                  {readyPct}%
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.rowPct, { color: colors.mutedForeground }]}>
              —
            </Text>
          )}
          <Feather
            name="chevron-right"
            size={14}
            color={colors.mutedForeground + "60"}
          />
        </View>
      </Pressable>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...cardShadow,
  },

  rowPct: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    minWidth: 34,
    textAlign: "right",
  },

  deviceMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  miniCells: { flexDirection: "row", gap: 3 },

  deviceInfo: { flex: 1 },
  deviceName: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },

  miniCell: { width: 9, height: 16, borderRadius: 2 },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  deviceRowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
});

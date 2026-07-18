import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import YesNoModal from "./modals/YesNoModal";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useBattery } from "@/context/BatteryContext";
import colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { Battery, BatteryStatus } from "@/types";

interface BatteryItemProps {
  battery: Battery;
  onEdit: (battery: Battery) => void;
}

const STATUS_CYCLE: BatteryStatus[] = ["charged", "charging", "discharged"];

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

export function BatteryItem({ battery, onEdit }: BatteryItemProps) {
  const t = useTranslation();
  const { updateBattery, deleteBattery } = useBattery();

  const [modalVisible, setModalVisible] = useState(false);

  const statusColor =
    battery.status === "charged"
      ? colors.charged
      : battery.status === "charging"
        ? colors.charging
        : colors.discharged;

  const statusLabel =
    battery.status === "charged"
      ? t.statusCharged
      : battery.status === "charging"
        ? t.statusCharging
        : t.statusDischarged;

  const handleDeleteRequest = () => {
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    setModalVisible(false);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await deleteBattery(battery.id);
  };

  const handleCycleStatus = async () => {
    const idx = STATUS_CYCLE.indexOf(battery.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateBattery(battery.id, battery.name, next);
  };

  return (
    <>
      <SwipeableRow
        onDelete={handleDeleteRequest}
        onEdit={() => onEdit(battery)}
      >
        <View style={[styles.item]}>
          <Pressable onPress={handleCycleStatus} style={styles.statusPressable}>
            <View
              style={[styles.statusBar, { backgroundColor: statusColor }]}
            />
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Ionicons name="battery-full" size={32} color={statusColor} />
            </View>
          </Pressable>

          <View style={styles.middle}>
            <Text
              style={[styles.name, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {battery.name}
            </Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <View style={styles.rightSide}>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>
              {formatRelativeTime(battery.updatedAt)}
            </Text>

            <Pressable onPress={() => onEdit(battery)} style={styles.moreBtn}>
              <Feather
                name="more-vertical"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </SwipeableRow>

      <YesNoModal
        visible={modalVisible}
        title={t.deleteBattery}
        message={`Remove "${battery.name}"?`}
        cancelText={t.deleteCancel}
        confirmText={t.deleteConfirm}
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    minHeight: 60,
  },
  statusPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 0,
  },
  statusBar: {
    width: 3,
    height: "100%",
    minHeight: 56,
  },
  statusDot: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  statusDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  middle: {
    flex: 1,
    gap: 3,
    paddingLeft: 15,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  moreBtn: {
    padding: 2,
  },
  divider: {
    height: 1,
    marginLeft: 3,
  },
});

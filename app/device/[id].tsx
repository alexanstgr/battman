import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";

import { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddEditBatterySheet } from "@/components/AddEditBatterySheet";
import { AddEditDeviceSheet } from "@/components/AddEditDeviceSheet";
import { BatteryItem } from "@/components/BatteryItem";
import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { useBattery } from "@/context/BatteryContext";
import colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { Battery } from "@/types";

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { getDevice, getBatteriesForDevice, deleteDevice } = useBattery();

  const [batterySheetVisible, setBatterySheetVisible] = useState(false);
  const [deviceSheetVisible, setDeviceSheetVisible] = useState(false);
  const [editBattery, setEditBattery] = useState<Battery | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const device = getDevice(id);
  const batteries = getBatteriesForDevice(id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const charged = batteries.filter((b) => b.status === "charged").length;
  const charging = batteries.filter((b) => b.status === "charging").length;
  const discharged = batteries.filter((b) => b.status === "discharged").length;
  const total = batteries.length;

  const readyPct = total > 0 ? Math.round((charged / total) * 100) : 0;

  const handleDeleteDevice = () => {
    Alert.alert(t.deleteDevice, t.deleteDeviceConfirm(device?.name ?? ""), [
      { text: t.deleteCancel, style: "cancel" },
      {
        text: t.deleteConfirm,
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          await deleteDevice(id);
          router.back();
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!device) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
          Device not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setDeviceSheetVisible(true)}
              style={styles.actionBtn}
            >
              <Feather name="edit" size={22} color={colors.mutedForeground} />
            </Pressable>
            <Pressable onPress={handleDeleteDevice} style={styles.actionBtn}>
              <Feather name="trash-2" size={22} color={colors.destructive} />
            </Pressable>
          </View>
        </View>

        <View style={styles.deviceTitleRow}>
          <CategoryIcon
            category={device.category}
            size={16}
            showBackground={false}
          />
          <View style={styles.deviceTitleBlock}>
            <Text style={[styles.deviceName, { color: colors.foreground }]}>
              {device.name}
            </Text>
            <Text style={[styles.deviceCategory, { color: colors.primary }]}>
              {getCategoryLabel(device.category).toUpperCase()}
            </Text>
          </View>
          {total > 0 && (
            <Text
              style={[
                styles.readyPct,
                { color: readyPct > 50 ? colors.charged : colors.discharged },
              ]}
            >
              {readyPct}%
            </Text>
          )}
        </View>

        {/* STAT BARS */}
        <View style={styles.statRow}>
          {[
            {
              label: t.statusCharged.toUpperCase(),
              count: charged,
              color: colors.charged,
            },
            {
              label: t.statusCharging.toUpperCase(),
              count: charging,
              color: colors.charging,
            },
            {
              label: t.statusDischarged.toUpperCase(),
              count: discharged,
              color: colors.discharged,
            },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                styles.statBox,
                { backgroundColor: colors.card, borderColor: "#00000039" },
              ]}
            >
              <Text style={[styles.statNum, { color: item.color }]}>
                {item.count}
              </Text>
              <Text style={[styles.statLabel, { color: item.color }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {total > 0 && (
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            {charged > 0 && (
              <View
                style={{ flex: charged, backgroundColor: colors.charged }}
              />
            )}
            {charging > 0 && (
              <View
                style={{ flex: charging, backgroundColor: colors.charging }}
              />
            )}
            {discharged > 0 && (
              <View
                style={{ flex: discharged, backgroundColor: colors.discharged }}
              />
            )}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <FlatList
        data={batteries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 120 : 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="battery"
            title={t.emptyBatteriesTitle}
            subtitle={t.emptyBatteriesSubtitle}
          />
        }
        renderItem={({ item }) => (
          <BatteryItem
            battery={item}
            onEdit={(b) => {
              setEditBattery(b);
              setBatterySheetVisible(true);
            }}
          />
        )}
      />

      <FAB
        onPress={() => {
          setEditBattery(null);
          setBatterySheetVisible(true);
        }}
      />

      <AddEditBatterySheet
        visible={batterySheetVisible}
        deviceId={id}
        battery={editBattery}
        onClose={() => {
          setBatterySheetVisible(false);
          setEditBattery(null);
        }}
      />
      <AddEditDeviceSheet
        visible={deviceSheetVisible}
        device={device}
        onClose={() => setDeviceSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: colors.background,
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerActions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 8 },
  deviceTitleRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  deviceTitleBlock: { flex: 1, gap: 2 },
  deviceName: {
    fontSize: 21,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  deviceCategory: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  readyPct: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    paddingBottom: 4,
  },
  statRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    gap: 3,
  },
  statNum: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  statLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  progressBar: {
    height: 3,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  divider: { height: 1, marginHorizontal: -20 },
  list: {},
});

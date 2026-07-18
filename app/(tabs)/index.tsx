import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import CategoryCard from "@/components/cards/CategoryCard";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DeviceCard from "@/components/cards/DeviceCard";
import { AddEditDeviceSheet } from "@/components/AddEditDeviceSheet";
import { getCategoryLabel } from "@/components/CategoryIcon";
import { DonutGauge } from "@/components/DonutGauge";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { useBattery } from "@/context/BatteryContext";
import themeColors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { Device, DeviceCategory } from "@/types";

import StatCard from "@/components/cards/StatCard";
import Logo from "@/components/Logo";
type FilterValue = DeviceCategory | "all";

const ALL_CATEGORIES: DeviceCategory[] = [
  "cameras",
  "lights",
  "audio",
  "drones",
  "other",
];

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { devices, batteries, deleteDevice } = useBattery();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalBatt = batteries.length;
  const charged = batteries.filter((b) => b.status === "charged").length;
  const charging = batteries.filter((b) => b.status === "charging").length;
  const discharged = batteries.filter((b) => b.status === "discharged").length;

  const ALL_FILTERS: { value: FilterValue; label: string }[] = [
    { value: "all", label: t.filterAll },
    { value: "cameras", label: t.filterCameras },
    { value: "lights", label: t.filterLights },
    { value: "audio", label: t.filterAudio },
    { value: "drones", label: t.filterDrones },
    { value: "other", label: t.filterOther },
  ];

  const filtered = useMemo(
    () =>
      devices.filter((d) => {
        const matchFilter = filter === "all" || d.category === filter;
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
      }),
    [devices, filter, search],
  );

  const catSummaries = useMemo(
    () =>
      ALL_CATEGORIES.map((cat) => {
        const catDevices = devices.filter((d) => d.category === cat);
        const catBatt = batteries.filter((b) =>
          catDevices.some((d) => d.id === b.deviceId),
        );
        const catCharged = catBatt.filter((b) => b.status === "charged").length;
        return {
          category: cat,
          deviceCount: catDevices.length,
          battCount: catBatt.length,
          charged: catCharged,
          pct:
            catBatt.length > 0
              ? Math.round((catCharged / catBatt.length) * 100)
              : null,
        };
      }).filter((c) => c.deviceCount > 0),
    [devices, batteries],
  );

  const handleDelete = (device: Device) => {
    Alert.alert(t.deleteDevice, t.deleteDeviceConfirm(device.name), [
      { text: t.deleteCancel, style: "cancel" },
      {
        text: t.deleteConfirm,
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          await deleteDevice(device.id);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 120 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ paddingTop: topPad }}>
            <View style={styles.header}>
              <View>
                <Logo />
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: themeColors.card,
                      shadowColor: themeColors.shadow,
                    },
                  ]}
                  onPress={() => setSearchVisible((v) => !v)}
                >
                  <Feather
                    name={searchVisible ? "x" : "search"}
                    size={18}
                    color={themeColors.foreground}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {searchVisible && (
              <View
                style={[
                  styles.searchWrap,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Feather
                  name="search"
                  size={15}
                  color={themeColors.mutedForeground}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: themeColors.foreground },
                  ]}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t.searchPlaceholder}
                  placeholderTextColor={themeColors.mutedForeground}
                  autoFocus
                />
              </View>
            )}

            <View style={styles.heroCard}>
              <View style={styles.heroInner}>
                {/* Gauge left side */}
                <View style={styles.gaugeWrap}>
                  <Text
                    style={[
                      styles.heroTitle,
                      { color: themeColors.mutedForeground },
                    ]}
                  >
                    {t.gearReady}
                  </Text>
                  <DonutGauge
                    charged={charged}
                    charging={charging}
                    discharged={discharged}
                  />
                </View>

                {/* Legend right side */}
                <View style={styles.heroLegend}>
                  {[
                    {
                      label: t.statusCharged,
                      count: charged,
                      color: themeColors.charged,
                    },
                    {
                      label: t.statusCharging,
                      count: charging,
                      color: themeColors.charging,
                    },
                    {
                      label: t.statusDischarged,
                      count: discharged,
                      color: themeColors.discharged,
                    },
                  ].map((item) => (
                    <View key={item.label} style={styles.legendRow}>
                      <View style={styles.legendLeft}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.legendLabel,
                            { color: themeColors.mutedForeground },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      <Text style={[styles.legendCount, { color: item.color }]}>
                        {item.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ── QUICK STATS 2×2 ────────────────────────────────── */}
            <View style={styles.statGrid}>
              <StatCard
                icon="grid-outline"
                label={t.statDevices}
                value={devices.length}
                color={themeColors.primary}
                colors={themeColors}
              />
              <StatCard
                icon="battery-charging-outline"
                label={t.statBatteries}
                value={totalBatt}
                color={themeColors.foreground}
                colors={themeColors}
              />
              <StatCard
                icon="battery-full-outline"
                label={t.statReady}
                value={charged}
                color={themeColors.charged}
                colors={themeColors}
              />
              <StatCard
                icon="battery-dead-outline"
                label={t.statNeedsCharge}
                value={discharged}
                color={themeColors.discharged}
                colors={themeColors}
              />
            </View>

            {/* ── CATEGORY TILES (horizontal scroll) ─────────────── */}
            {catSummaries.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScroll}
              >
                {catSummaries.map((cat) => (
                  <CategoryCard
                    key={cat.category}
                    category={cat.category}
                    battCount={cat.battCount}
                    pct={cat.pct}
                    selected={filter === cat.category}
                    themeColors={themeColors}
                    styles={styles}
                    getCategoryLabel={getCategoryLabel}
                    onPress={() => {
                      setFilter(cat.category);
                      Haptics.selectionAsync();
                    }}
                  />
                ))}
              </ScrollView>
            )}

            <View style={styles.listHeader}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {ALL_FILTERS.map((f) => {
                  const isActive = filter === f.value;
                  return (
                    <TouchableOpacity
                      key={f.value}
                      onPress={() => {
                        setFilter(f.value);
                        Haptics.selectionAsync();
                      }}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isActive
                            ? themeColors.primary
                            : themeColors.background,
                          borderColor: isActive
                            ? themeColors.primary
                            : themeColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          {
                            color: isActive
                              ? themeColors.primaryForeground
                              : themeColors.mutedForeground,
                          },
                        ]}
                      >
                        {f.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title={search ? t.emptySearchTitle : t.emptyDevicesTitle}
            subtitle={search ? t.emptySearchSubtitle : t.emptyDevicesSubtitle}
          />
        }
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            batteries={batteries.filter((b) => b.deviceId === item.id)}
            onDelete={() => handleDelete(item)}
            onEdit={() => {
              setEditDevice(item);
              setSheetVisible(true);
            }}
            colors={themeColors}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <FAB
        onPress={() => {
          setEditDevice(null);
          setSheetVisible(true);
        }}
      />

      <AddEditDeviceSheet
        visible={sheetVisible}
        device={editDevice}
        onClose={() => {
          setSheetVisible(false);
          setEditDevice(null);
        }}
      />
    </View>
  );
}

const cardShadow = {
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.012,
  shadowRadius: 5,
  elevation: 2,
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 0 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  appSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8, paddingTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  heroCard: {
    backgroundColor: themeColors.card,
    borderColor: themeColors.cardBorderColor,
    borderWidth: themeColors.cardBorderWidth,
    borderRadius: 18,
    marginBottom: 14,
  },
  heroInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 12,
  },
  heroTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  gaugeWrap: { alignItems: "center" },

  heroLegend: { flex: 1, gap: 10, paddingLeft: 4 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  legendCount: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  catScroll: { gap: 10, paddingRight: 4, marginBottom: 16 },
  catTile: {
    width: 90,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    alignItems: "flex-start",
    ...cardShadow,
  },
  catTileIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  catTileName: { fontSize: 12, fontFamily: "Inter_700Bold" },
  catTileCount: { fontSize: 10, fontFamily: "Inter_400Regular" },
  catTilePct: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  listHeaderTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  filterRow: { gap: 6, paddingRight: 2 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
});
